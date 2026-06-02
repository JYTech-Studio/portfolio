import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  role?: string;
  year?: string;
  stack: string[];
  cover?: string;
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
};

export type Project = ProjectMeta & { content: string };

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getProject(slug: string): Project | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, content, ...(data as Omit<ProjectMeta, "slug">) } as Project;
}

export function getAllProjects(): Project[] {
  return getProjectSlugs()
    .map(getProject)
    .filter((p): p is Project => p !== null)
    .sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""));
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured);
}
