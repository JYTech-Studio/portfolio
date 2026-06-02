import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.brand}
        </p>
        <a
          href={`mailto:${site.email}`}
          className="transition-colors hover:text-foreground"
        >
          {site.email}
        </a>
      </div>
    </footer>
  );
}
