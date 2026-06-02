import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "作品",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">作品</h1>
        <p className="mt-4 text-muted">
          每個案例都記錄了問題、做法與成果。點進去看細節。
        </p>
      </header>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      {projects.length === 0 && (
        <p className="mt-10 text-muted">
          還沒有作品。到 <code>content/projects/</code> 新增一個 .mdx 檔即可。
        </p>
      )}
    </div>
  );
}
