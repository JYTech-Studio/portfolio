import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProject, getProjectSlugs } from "@/lib/projects";
import { mdxComponents } from "@/components/mdx";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← 回到作品
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          {project.year && <span className="text-muted">{project.year}</span>}
        </div>
        <p className="mt-4 text-lg text-muted">{project.summary}</p>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.role && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                角色
              </dt>
              <dd className="mt-1 text-sm">{project.role}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">
              技術棧
            </dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        {(project.demoUrl || project.repoUrl) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                線上 Demo ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                原始碼 ↗
              </a>
            )}
          </div>
        )}
      </header>

      {project.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover}
          alt={project.title}
          className="mt-10 w-full rounded-2xl border border-border"
        />
      )}

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-accent">
        <MDXRemote source={project.content} components={mdxComponents} />
      </div>
    </article>
  );
}
