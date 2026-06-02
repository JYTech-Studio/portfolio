import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.brand}
        </p>
        <div className="flex items-center gap-4">
          {site.socials.github && (
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          )}
          {site.socials.line && (
            <a
              href={site.socials.line}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              LINE
            </a>
          )}
          <a
            href={`mailto:${site.email}`}
            className="transition-colors hover:text-foreground"
          >
            {site.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
