import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent">
          {project.title}
        </h3>
        {project.year && (
          <span className="shrink-0 text-sm text-muted">{project.year}</span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {project.summary}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 5).map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>
    </Link>
  );
}
