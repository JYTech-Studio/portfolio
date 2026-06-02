import Link from "next/link";
import { site } from "@/lib/site";
import { BrandMark } from "@/components/brand-mark";

const nav = [
  { href: "/projects", label: "作品" },
  { href: "/about", label: "關於我" },
  { href: "/#contact", label: "聯絡" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <BrandMark className="h-6 w-6 shrink-0" />
          <span>
            {site.brand}
            <span className="text-muted">.dev</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
