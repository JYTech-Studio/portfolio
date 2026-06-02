import Link from "next/link";
import { getFeaturedProjects, getAllProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";
import { site } from "@/lib/site";

export default function Home() {
  const featured = getFeaturedProjects();
  const projects = featured.length > 0 ? featured : getAllProjects().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <p className="text-sm font-medium text-accent">{site.title}</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {site.brand} 專注於用 Next.js / React
          打造好用、好維護、能上線賺錢的網站與系統。歡迎看看作品,或直接聊聊你的專案。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            看作品
          </Link>
          <a
            href={`mailto:${site.email}`}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            談合作
          </a>
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-t border-border py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">精選作品</h2>
          <Link
            href="/projects"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            全部作品 →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="border-t border-border py-20 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight">有專案想做?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          不論是全新網站、既有系統優化,或單純想討論技術選型,都歡迎聊聊。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {site.socials.line && (
            <a
              href={site.socials.line}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              加 LINE 諮詢
            </a>
          )}
          <a
            href={`mailto:${site.email}`}
            className="inline-block rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            寄信給我
          </a>
        </div>
      </section>
    </div>
  );
}
