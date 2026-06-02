import { IconCheck } from "@/components/icons";

// Hero 右側的「工程資訊視覺模組」：模擬真實的 deploy / 系統概覽介面，
// 數據對應實際案例（鎧福旅遊報名管理系統）。純展示、無互動。
const pipeline = [
  { step: "install", detail: "依賴安裝", ms: "4.1s" },
  { step: "build", detail: "Next.js 16 · TypeScript", ms: "23.7s" },
  { step: "deploy", detail: "Production", ms: "2.3s" },
];

const stack = ["Next.js", "React", "Supabase", "PostgreSQL", "Tailwind"];

const modules = [
  { label: "後台模組", value: "9" },
  { label: "API routes", value: "65" },
  { label: "資料表", value: "14" },
  { label: "版本", value: "v2.0.5" },
];

export function HeroConsole() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]">
      {/* 視窗標題列 */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="ml-1 font-mono text-xs text-muted">jytech.dev — deploy</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>

      {/* Pipeline */}
      <div className="space-y-2.5 px-4 py-4">
        {pipeline.map((p) => (
          <div key={p.step} className="flex items-center gap-3 font-mono text-xs">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <IconCheck className="h-3 w-3" />
            </span>
            <span className="w-16 shrink-0 font-medium text-foreground">
              {p.step}
            </span>
            <span className="min-w-0 truncate text-muted">{p.detail}</span>
            <span className="ml-auto shrink-0 tabular-nums text-muted">
              {p.ms}
            </span>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div className="border-t border-border px-4 py-3.5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">
          stack
        </p>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* System modules */}
      <div className="grid grid-cols-4 divide-x divide-border border-t border-border bg-surface">
        {modules.map((m) => (
          <div key={m.label} className="px-2 py-3 text-center">
            <div className="font-mono text-base font-semibold tabular-nums text-foreground">
              {m.value}
            </div>
            <div className="mt-0.5 text-[10px] text-muted">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
