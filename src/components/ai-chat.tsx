"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_WELCOME } from "@/lib/persona";

type Msg = { role: "user" | "assistant"; content: string };

// 對話歷史上限：前端最多保留 / 送出最後 N 則（server 也會再砍一次）。
const MAX_HISTORY = 12;

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [provider, setProvider] = useState<"gemini" | "claude">("gemini");
  const [adminToken, setAdminToken] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem("chatAdminToken") || "",
  );
  const composing = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  // 帶上目前的管理密鑰去問供應商清單（有效 token 才會拿到 claude）。
  const loadProviders = useCallback((token: string) => {
    fetch("/api/chat", {
      headers: token ? { "x-chat-admin-token": token } : {},
    })
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProviders(adminToken);
    // 只在掛載時抓一次；解鎖管理密鑰後會另外手動重抓。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, busy, open]);

  const canSwitch = Boolean(adminToken) && providers.includes("claude");

  async function send() {
    const q = input.trim();
    if (busy || !q) return;
    setInput("");
    // 只保留 / 送出最後 MAX_HISTORY 則，避免長聊 payload 過大。
    const next = [...messages, { role: "user" as const, content: q }].slice(-MAX_HISTORY);
    setMessages(next);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-chat-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({ messages: next, provider }),
      });
      const d = await r.json();
      const text = d.answer || d.error || "（沒有回應）";
      setMessages((m) => [...m, { role: "assistant", content: text }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "連線出了點問題，請稍後再試 🙏" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function unlockAdmin() {
    const t = window.prompt("輸入管理密鑰即可切換回答模型（一般訪客免填）", adminToken);
    if (t === null) return;
    localStorage.setItem("chatAdminToken", t);
    setAdminToken(t);
    // 用新 token 重新抓供應商清單：有效才會拿到 claude、解鎖切換 UI。
    loadProviders(t);
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "關閉 AI 分身" : "開啟 AI 分身聊聊"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* 聊天面板 */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[34rem] max-h-[calc(100vh-8rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* 標頭 */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-success" />
            <div className="flex-1">
              <p className="text-sm font-semibold leading-none">跟我的 AI 分身聊聊</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                由 <ModelLogo provider={provider} />
                {provider === "claude" ? "Claude" : "Gemini"} 驅動 · 依履歷回答
              </p>
            </div>
            {canSwitch ? (
              <div className="flex overflow-hidden rounded-full border border-border text-[11px]">
                {(["gemini", "claude"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex items-center gap-1 px-2.5 py-1 ${
                      provider === p ? "bg-accent text-white" : "text-muted"
                    }`}
                  >
                    <ModelLogo provider={p} />
                    {p === "gemini" ? "Gemini" : "Claude"}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={unlockAdmin}
                aria-label="管理：切換模型"
                className="text-muted/60 transition-colors hover:text-muted"
                title="切換回答模型（需管理密鑰）"
              >
                ⚙
              </button>
            )}
          </div>

          {/* 訊息 */}
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble role="assistant" text={CHAT_WELCOME} />
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {busy && <Bubble role="assistant" text="思考中…" muted />}
          </div>

          {/* 輸入列 */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onCompositionStart={() => (composing.current = true)}
                onCompositionEnd={() => (composing.current = false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !composing.current) send();
                }}
                placeholder="例如：他會 Python 嗎？做過哪些專案？"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={send}
                disabled={busy}
                className="shrink-0 rounded-lg bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                送出
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted">
              對話會被記錄以改進服務 · 找不到的問題請 email wjycompany@gmail.com
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({
  role,
  text,
  muted,
}: {
  role: "user" | "assistant";
  text: string;
  muted?: boolean;
}) {
  const me = role === "user";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          me
            ? "rounded-br-sm bg-accent text-white"
            : `rounded-bl-sm bg-surface text-foreground ${muted ? "text-muted" : ""}`
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function ModelLogo({ provider }: { provider: "gemini" | "claude" }) {
  if (provider === "gemini") {
    return (
      <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="aichat-gemini" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4796E3" />
            <stop offset=".5" stopColor="#9177C7" />
            <stop offset="1" stopColor="#D96570" />
          </linearGradient>
        </defs>
        <path
          d="M12 0c.4 6.6 5 11.2 12 12-7 .8-11.6 5.4-12 12-.4-6.6-5-11.2-12-12 7-.8 11.6-5.4 12-12z"
          fill="url(#aichat-gemini)"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden>
      <g fill="#D97757">
        <rect x="11" y="0" width="2" height="24" rx="1" />
        <rect x="0" y="11" width="24" height="2" rx="1" />
        <rect x="11" y="0" width="2" height="24" rx="1" transform="rotate(45 12 12)" />
        <rect x="11" y="0" width="2" height="24" rx="1" transform="rotate(-45 12 12)" />
      </g>
    </svg>
  );
}
