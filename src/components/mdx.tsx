import type { ReactNode } from "react";
import { MdxImage } from "@/components/mdx-image";

/** 多張截圖並排：<Gallery> 裡放數張 ![](...) 即可 */
function Gallery({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2 [&_figure]:my-0">
      {children}
    </div>
  );
}

/**
 * YouTube 影片嵌入：<YouTube id="影片ID" title="說明" />
 * 顯示原生播放框（縮圖 + 播放鍵 + 標題），點擊直接播放。
 * id = YouTube 網址 watch?v= 後面那串。
 */
function YouTube({ id, title }: { id: string; title?: string }) {
  return (
    <figure className="my-8">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title ?? "Demo 影片"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {title && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {title}
        </figcaption>
      )}
    </figure>
  );
}

export const mdxComponents = {
  img: MdxImage,
  Gallery,
  YouTube,
};
