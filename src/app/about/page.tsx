import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "關於我",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">關於我</h1>

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-a:text-accent">
        <p>
          我是 {site.name},一名{site.title}。我喜歡把模糊的需求,一步步拆解成
          清楚、可維護、能真正上線運作的產品。從前端介面、後端 API
          到資料庫設計,我習慣對整條鏈路負責。
        </p>
        <p>
          相信細節決定品質——表單驗證、權限、計價邏輯、RWD
          這些看不見的地方,往往才是專案成敗的關鍵。
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-sm uppercase tracking-wide text-muted">技能</h2>
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

      <section className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">聯絡方式</h2>
        <p className="mt-2 text-muted">
          有專案或合作想法,歡迎來信:
        </p>
        <a
          href={`mailto:${site.email}`}
          className="mt-3 inline-block font-medium text-accent hover:underline"
        >
          {site.email}
        </a>
      </section>
    </div>
  );
}
