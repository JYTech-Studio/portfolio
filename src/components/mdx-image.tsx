"use client";

import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { IconZoomIn, IconClose } from "@/components/icons";

/** MDX 圖片：縮圖顯示，點擊可全螢幕放大檢視（ESC / 點背景關閉）。 */
export function MdxImage({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (typeof src !== "string") return null;

  return (
    <figure className="my-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `放大檢視：${alt}` : "放大檢視圖片"}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} loading="lazy" className="block w-full" />
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <IconZoomIn className="h-3.5 w-3.5" />
          放大
        </span>
      </button>

      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {alt}
        </figcaption>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt ?? "圖片"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
          <button
            type="button"
            aria-label="關閉"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      )}
    </figure>
  );
}
