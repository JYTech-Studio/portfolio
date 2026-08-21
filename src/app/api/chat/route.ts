import Anthropic from "@anthropic-ai/sdk";
import { buildSystem } from "@/lib/persona";
import {
  checkLimits,
  costUsd,
  ipHash,
  readUsage,
  recordSpend,
  type TokenUsage,
} from "@/lib/chat-budget";

export const runtime = "nodejs";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
// 預設用 Haiku（最便宜，訪客也能自由切）；要更高品質可設成 claude-opus-4-8。
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";
const MAX_TOKENS = 1024;
// Claude 另外壓低輸出上限與帶入的歷史則數，單則成本才壓得住。
const CLAUDE_MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS) || 800;
const CLAUDE_HISTORY = 8;

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

function availableProviders(): string[] {
  const list: string[] = [];
  if (process.env.GEMINI_API_KEY) list.push("gemini");
  if (process.env.ANTHROPIC_API_KEY) list.push("claude");
  return list;
}

/** 帶有效管理密鑰＝我本人，不受預算與速率限制。 */
function isAdmin(req: Request): boolean {
  const adminToken = process.env.CHAT_ADMIN_TOKEN;
  const sent = req.headers.get("x-chat-admin-token");
  return Boolean(adminToken) && sent === adminToken;
}

/**
 * 前端用：有哪些供應商可選、預設哪個、Claude 目前還能不能用。
 * Claude 對所有訪客開放，但花費超過預算（或這個 IP 今天問太多）時會標成不可用，
 * 前端就把切換鈕鎖起來。
 */
export async function GET(req: Request) {
  const providers = availableProviders();
  let claudeBlocked: string | null = null;

  if (providers.includes("claude") && !isAdmin(req)) {
    const usage = await readUsage(ipHash(req), { cache: true });
    claudeBlocked = checkLimits(usage)?.message ?? null;
  }

  return Response.json({
    providers,
    default: "gemini",
    claudeBlocked,
  });
}

// ---- 各供應商作答 ----

async function answerGemini(messages: Msg[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: buildSystem() }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: MAX_TOKENS },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: { text?: string }) => p.text || "").join("").trim();
}

type ClaudeAnswer = { text: string; usage: TokenUsage };

async function answerClaude(messages: Msg[]): Promise<ClaudeAnswer> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const resp = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    // 履歷（system）每次都一樣 → 開 prompt caching，5 分鐘內的後續提問輸入只算 1 成價錢
    system: [
      { type: "text", text: buildSystem(), cache_control: { type: "ephemeral" } },
    ],
    messages: messages.slice(-CLAUDE_HISTORY).map((m) => ({ role: m.role, content: m.content })),
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return { text, usage: resp.usage };
}

/** 暫時性錯誤（503 高需求、429 限流、連線抖動）自動重試。 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient = /(^|\D)(429|503|529)(\D|$)|UNAVAILABLE|overloaded|high demand/i.test(msg);
      if (!transient || attempt === 2) break;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// ---- 對話紀錄寫進 Supabase（選用；沒設環境變數就略過）----

type LogRow = {
  question: string;
  answer: string;
  provider: string;
  country: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number;
  ip_hash: string | null;
};

async function logChat(row: LogRow): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  // 加上短 timeout：Supabase 慢或掛掉時，最多等 2 秒就放棄，不拖慢回答。
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const res = await fetch(`${url}/rest/v1/portfolio_chat_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      // 非 2xx 也只是記錄失敗，不影響回答
      console.warn(`logChat: Supabase 回應 ${res.status}`);
    }
  } catch {
    // 記錄失敗 / timeout 不影響回答
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let payload: { messages?: Msg[]; provider?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  // 清理對話歷史：只留 user / assistant、先砍到最後 12 則再做 map（避免超大 payload 多做白工）
  const messages: Msg[] = (Array.isArray(payload.messages) ? payload.messages : [])
    .filter(
      (m): m is Msg =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser || !lastUser.content.trim()) {
    return Response.json({ error: "請輸入問題" }, { status: 400 });
  }

  const providers = availableProviders();
  if (providers.length === 0) {
    return Response.json(
      { error: "伺服器尚未設定 LLM 金鑰（GEMINI_API_KEY）" },
      { status: 503 },
    );
  }

  // 先決定「實際會用」的供應商：未知 / 未配置就 fallback 到第一個可用的。
  let provider = (payload.provider || "gemini").toLowerCase();
  if (!providers.includes(provider)) provider = providers[0];

  // Claude 對所有訪客開放，但要先過預算與速率檢查（管理密鑰不受限）。
  // 超額時：能退回 Gemini 就退回並附上說明，只有 Claude 可用就直接 429。
  const hash = ipHash(req);
  let notice: string | null = null;
  if (provider === "claude" && !isAdmin(req)) {
    const block = checkLimits(await readUsage(hash));
    if (block) {
      if (providers.includes("gemini")) {
        provider = "gemini";
        notice = block.message;
      } else {
        return Response.json({ error: block.message }, { status: 429 });
      }
    }
  }

  try {
    let answer: string;
    let model: string | null = null;
    let usage: TokenUsage | null = null;
    let cost = 0;

    if (provider === "claude") {
      const result = await withRetry(() => answerClaude(messages));
      answer = result.text;
      usage = result.usage;
      model = CLAUDE_MODEL;
      cost = costUsd(CLAUDE_MODEL, usage);
      recordSpend(hash, cost);
    } else {
      answer = await withRetry(() => answerGemini(messages));
      model = GEMINI_MODEL;
    }

    const country = req.headers.get("x-vercel-ip-country");
    await logChat({
      question: lastUser.content,
      answer,
      provider,
      country,
      model,
      input_tokens: usage?.input_tokens ?? null,
      output_tokens: usage?.output_tokens ?? null,
      cost_usd: Number(cost.toFixed(6)),
      ip_hash: hash,
    });

    return Response.json({ answer, provider, notice });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      {
        error:
          "AI 暫時無法回答（可能是額度或網路問題），請稍後再試，或直接用 email 聯絡 wjycompany@gmail.com。",
        detail: message.slice(0, 200),
      },
      { status: 502 },
    );
  }
}
