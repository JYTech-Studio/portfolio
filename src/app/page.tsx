import Link from "next/link";
import { getFeaturedProjects, getAllProjects } from "@/lib/projects";
import { FeaturedProjectCard, ProjectCard } from "@/components/project-card";
import { HeroConsole } from "@/components/hero-console";
import { Capabilities } from "@/components/capabilities";
import { IconArrowRight, IconLine, IconMail } from "@/components/icons";
import { site } from "@/lib/site";

export default function Home() {
  const featured = getFeaturedProjects();
  const [lead, ...restFeatured] = featured;
  const secondary =
    featured.length > 0 ? restFeatured : getAllProjects().slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div
          aria-hidden
          className="bg-dotgrid pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]"
        />
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
          {/* 左：標題 + 介紹 + CTA */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {site.title}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {site.brand} 專注於用 Next.js / React / Supabase
              打造好用、好維護、能上線賺錢的網站與系統。從前端到資料庫，一手交付。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                看作品
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#contact"
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                談合作
              </Link>
            </div>
          </div>

          {/* 右：工程資訊視覺模組 */}
          <div className="lg:pl-4">
            <HeroConsole />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-border py-14 sm:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">能做的事</h2>
          <Link
            href="/about"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            關於我 →
          </Link>
        </div>
        <div className="mt-8">
          <Capabilities />
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-t border-border py-14 sm:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">精選作品</h2>
          <Link
            href="/projects"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            全部作品 →
          </Link>
        </div>
        {lead && (
          <div className="mt-8">
            <FeaturedProjectCard project={lead} />
          </div>
        )}
        {secondary.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {secondary.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border py-14 sm:py-16">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="bg-dotgrid relative px-6 py-12 text-center sm:px-10 sm:py-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              有專案想做？
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              不論是全新網站、既有系統優化，或單純想討論技術選型，都歡迎聊聊。
            </p>
            <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              {site.socials.line && (
                <a
                  href={site.socials.line}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <IconLine className="h-4 w-4" />
                  加 LINE 諮詢
                </a>
              )}
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                <IconMail className="h-4 w-4" />
                寄信給我
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
