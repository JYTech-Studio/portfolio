// Claude 的花費控管：把 token 用量換算成美金、累計、超過預算就不讓訪客再用 Claude。
//
// 三層防護中的第二、三層（第一層是 Anthropic Console 的 workspace 月支出上限，
// 那層才是硬保證；這裡是「正常情況下根本不會碰到硬上限」的軟控管）：
//   - 預算帳本：本期 Claude 累計花費 >= CLAUDE_BUDGET_USD 就退回 Gemini
//   - 速率限制：同一個 IP 24 小時內最多 CLAUDE_DAILY_LIMIT_PER_IP 則 Claude
//
// 帳本存在 Supabase（多個 serverless 實例共用同一份數字）；沒設定 Supabase 時
// 退化成「單一實例的記憶體計數」，只能擋住最粗暴的濫用，此時請務必依賴 Console 上限。

import { createHash } from "node:crypto";

/** 每百萬 token 的美金單價（Anthropic 官方定價）。 */
type Price = { input: number; output: number; cacheWrite: number; cacheRead: number };

const PRICING: Record<string, Price> = {
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  "claude-sonnet-5": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-opus-5": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  "claude-opus-4-8": { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
};

/** 不認得的模型一律用最貴的估：寧可高估花費提早停用，也不要低估燒過頭。 */
const FALLBACK_PRICE = PRICING["claude-opus-5"];

export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** 依模型單價把一次回答的 token 用量換算成美金。 */
export function costUsd(model: string, usage: TokenUsage): number {
  const p = PRICING[model] ?? FALLBACK_PRICE;
  const perToken =
    usage.input_tokens * p.input +
    usage.output_tokens * p.output +
    (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
    (usage.cache_read_input_tokens ?? 0) * p.cacheRead;
  return perToken / 1_000_000;
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** 本期預算（美金）。預設 $1。 */
export const BUDGET_USD = num(process.env.CLAUDE_BUDGET_USD, 1);

/** 同一個 IP 在 24 小時內最多幾則 Claude。設 0 表示不限制。 */
export const DAILY_LIMIT_PER_IP = num(process.env.CLAUDE_DAILY_LIMIT_PER_IP, 10);

/** 預算期間的起點：month（預設，每月 1 號重置）或 total（累計不重置）。 */
function budgetSince(): Date {
  if ((process.env.CLAUDE_BUDGET_WINDOW || "month").toLowerCase() === "total") {
    return new Date(0);
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** 把訪客 IP 加鹽雜湊：能做速率限制，但資料庫裡不留原始 IP。 */
export function ipHash(req: Request): string | null {
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";
  if (!ip) return null;
  const salt = process.env.CHAT_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "portfolio";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// ---- 記憶體備援計數（Supabase 沒設定 / 暫時讀不到時使用）----

const memory = {
  windowKey: "",
  spentUsd: 0,
  /** ip_hash → 最近幾次 Claude 回答的時間戳 */
  ips: new Map<string, number[]>(),
};

const DAY_MS = 24 * 60 * 60 * 1000;

function memoryUsage(hash: string | null): Usage {
  const key = budgetSince().toISOString();
  if (memory.windowKey !== key) {
    memory.windowKey = key;
    memory.spentUsd = 0;
    memory.ips.clear();
  }
  const since = Date.now() - DAY_MS;
  const hits = hash ? (memory.ips.get(hash) ?? []).filter((t) => t >= since) : [];
  return { spentUsd: memory.spentUsd, ipCount: hits.length };
}

// ---- 讀取用量 ----

export type Usage = { spentUsd: number; ipCount: number };

/** GET（前端問「Claude 還能不能用」）用的短快取，避免每次載入頁面都打一次 DB。 */
let cached: { at: number; usage: Usage } | null = null;
const CACHE_MS = 60_000;

async function supabaseUsage(hash: string | null): Promise<Usage | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/chat_claude_usage`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_ip_hash: hash,
        p_since: budgetSince().toISOString(),
        p_ip_since: new Date(Date.now() - DAY_MS).toISOString(),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.warn(`chat_claude_usage: Supabase 回應 ${res.status}`);
      return null;
    }
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : rows;
    return {
      spentUsd: Number(row?.spent_usd ?? 0) || 0,
      ipCount: Number(row?.ip_count ?? 0) || 0,
    };
  } catch {
    return null; // 逾時 / 網路問題：退回記憶體計數，別讓聊天整個掛掉
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 讀取本期 Claude 用量。DB 與記憶體兩邊取「比較大」的數字：
 * 剛寫入還沒被讀到、或 DB 暫時讀不到時，都不會低估花費。
 */
export async function readUsage(
  hash: string | null,
  opts: { cache?: boolean } = {},
): Promise<Usage> {
  const fallback = memoryUsage(hash);

  if (opts.cache && cached && Date.now() - cached.at < CACHE_MS) {
    return { spentUsd: Math.max(cached.usage.spentUsd, fallback.spentUsd), ipCount: fallback.ipCount };
  }

  const db = await supabaseUsage(hash);
  if (!db) return fallback;

  if (opts.cache) cached = { at: Date.now(), usage: db };
  return {
    spentUsd: Math.max(db.spentUsd, fallback.spentUsd),
    ipCount: Math.max(db.ipCount, fallback.ipCount),
  };
}

/** 記一筆 Claude 花費到記憶體（Supabase 那筆由 logChat 寫）。 */
export function recordSpend(hash: string | null, cost: number): void {
  memoryUsage(hash); // 順便處理跨月重置
  memory.spentUsd += cost;
  if (cached) cached.usage.spentUsd += cost;
  if (hash) {
    const since = Date.now() - DAY_MS;
    const hits = (memory.ips.get(hash) ?? []).filter((t) => t >= since);
    hits.push(Date.now());
    memory.ips.set(hash, hits);
  }
}

export type Block = { reason: "budget" | "rate"; message: string } | null;

/** 判斷這次要不要擋下 Claude。回傳 null 表示可以用。 */
export function checkLimits(usage: Usage): Block {
  if (BUDGET_USD > 0 && usage.spentUsd >= BUDGET_USD) {
    return {
      reason: "budget",
      message: "Claude 這期的體驗額度用完了，先由 Gemini 回答（下個月會重置）。",
    };
  }
  if (DAILY_LIMIT_PER_IP > 0 && usage.ipCount >= DAILY_LIMIT_PER_IP) {
    return {
      reason: "rate",
      message: `Claude 每人每天限 ${DAILY_LIMIT_PER_IP} 則，這次先由 Gemini 回答。`,
    };
  }
  return null;
}
