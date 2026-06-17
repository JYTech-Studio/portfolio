import Anthropic from "@anthropic-ai/sdk";
import { buildSystem } from "@/lib/persona";

export const runtime = "nodejs";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
// 預設用 Haiku（最便宜，對齊 rag-assistant demo）；要更高品質可設成 claude-opus-4-8。
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";
const MAX_TOKENS = 1024;

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

function availableProviders(): string[] {
  const list: string[] = [];
  if (process.env.GEMINI_API_KEY) list.push("gemini");
  if (process.env.ANTHROPIC_API_KEY) list.push("claude");
  return list;
}

/** 帶有效管理密鑰才算管理員（可切換 Claude）。 */
function isAdmin(req: Request): boolean {
  const adminToken = process.env.CHAT_ADMIN_TOKEN;
  const sent = req.headers.get("x-chat-admin-token");
  return Boolean(adminToken) && sent === adminToken;
}

/**
 * 前端用：知道有哪些供應商、預設是哪個、Claude 是否需要管理密鑰。
 * Claude 屬管理權限，只有帶有效管理密鑰的請求才會在清單看到它，
 * 一般訪客不會知道後台是否配置了 Claude。
 */
export async function GET(req: Request) {
  const admin = isAdmin(req);
  const providers = availableProviders().filter((p) => p !== "claude" || admin);
  return Response.json({
    providers,
    default: "gemini",
    adminRequired: Boolean(process.env.CHAT_ADMIN_TOKEN),
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

async function answerClaude(messages: Msg[]): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const resp = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystem(),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/** 暫時性錯誤（503 高需求、429 限流、連線抖動）自動重試。 */
async function withRetry(fn: () => Promise<string>): Promise<string> {
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

async function logChat(
  question: string,
  answer: string,
  provider: string,
  country: string | null,
): Promise<void> {
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
      body: JSON.stringify({ question, answer, provider, country }),
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

  // fallback 完成後，統一檢查：只要「實際會用」的 provider 是 Claude，就一定要帶
  // 有效管理密鑰，否則 403。這同時擋掉兩種繞過：
  //   1) 訪客明確指定 provider: "claude"
  //   2) 只設了 ANTHROPIC_API_KEY（缺 GEMINI_API_KEY），fallback 落到 Claude
  if (provider === "claude" && !isAdmin(req)) {
    return Response.json({ error: "切換 Claude 需要管理密鑰" }, { status: 403 });
  }

  try {
    const answer = await withRetry(() =>
      provider === "claude" ? answerClaude(messages) : answerGemini(messages),
    );

    const country = req.headers.get("x-vercel-ip-country");
    await logChat(lastUser.content, answer, provider, country);

    return Response.json({ answer, provider });
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
