"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { BrandMark } from "@/components/brand-mark";

const nav = [
  { href: "/projects", label: "作品" },
  { href: "/about", label: "關於我" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md font-semibold tracking-tight"
        >
          <BrandMark className="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-[15px]">
            {site.brand}
            <span className="text-muted">.dev</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-foreground/[0.06] font-medium text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/#contact"
            className="ml-2 rounded-full border border-border px-3.5 py-1.5 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            聯絡
          </Link>
        </nav>
      </div>
    </header>
  );
}
