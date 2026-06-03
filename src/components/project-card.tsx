import Link from "next/link";
import type { Project } from "@/lib/projects";
import { IconArrowRight, IconCheck } from "@/components/icons";

function StackTags({ stack, max = 5 }: { stack: string[]; max?: number }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {stack.slice(0, max).map((tech) => (
        <li
          key={tech}
          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}

// 精選案例：大尺寸 case-study 版型（內文 + 成果亮點），用於首頁主打作品。
export function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-accent/40 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.18)]"
    >
      {project.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover}
          alt=""
          className="aspect-[16/9] w-full border-b border-border object-cover object-top"
        />
      )}
      <div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-5">
        {/* 內容 */}
        <div className="bg-card p-6 sm:p-8 lg:col-span-3">
          <div className="flex items-center gap-2 text-xs font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            精選案例
            {project.year && (
              <span className="text-muted">· {project.year}</span>
            )}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {project.summary}
          </p>
          <div className="mt-5">
            <StackTags stack={project.stack} max={6} />
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            查看案例細節
            <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* 成果亮點 */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="bg-surface p-6 sm:p-8 lg:col-span-2">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-muted">
              highlights
            </p>
            <ul className="space-y-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-sm leading-snug">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <IconCheck className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-foreground/90">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Link>
  );
}

// 一般案例卡片（作品列表 / 精選區的次要作品）。
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,0.18)]"
    >
      {project.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover}
          alt=""
          className="mb-5 aspect-video w-full rounded-md border border-border object-cover"
        />
      )}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        {project.year && (
          <span className="shrink-0 text-sm text-muted">{project.year}</span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {project.summary}
      </p>
      <div className="mt-4">
        <StackTags stack={project.stack} />
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors group-hover:text-foreground">
        查看案例
        <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
