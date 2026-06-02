import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Capabilities } from "@/components/capabilities";
import { IconLine, IconMail, IconGitHub } from "@/components/icons";

export const metadata: Metadata = {
  title: "關於我",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {site.title}
      </p>
      <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
        關於我
      </h1>

      <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert prose-a:text-accent">
        <p>
          {site.brand} 是我的接案品牌，專注於{site.title}；主理人是我——{site.name}。
          我喜歡把模糊的需求，一步步拆解成清楚、可維護、能真正上線運作的產品。
          從前端介面、後端 API 到資料庫設計，我習慣對整條鏈路負責。
        </p>
        <p>
          相信細節決定品質——表單驗證、權限、計價邏輯、RWD
          這些看不見的地方，往往才是專案成敗的關鍵。
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          能做的事
        </h2>
        <div className="mt-4">
          <Capabilities />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          技術棧
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {site.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">聯絡方式</h2>
        <p className="mt-2 text-sm text-muted">
          有專案或合作想法，歡迎透過以下方式找我：
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {site.socials.line && (
            <a
              href={site.socials.line}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <IconLine className="h-4 w-4" />
              加 LINE 諮詢
            </a>
          )}
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            <IconMail className="h-4 w-4" />
            {site.email}
          </a>
          {site.socials.github && (
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground"
            >
              <IconGitHub className="h-4 w-4" />
              GitHub
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
