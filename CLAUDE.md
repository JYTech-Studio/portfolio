@AGENTS.md

# Portfolio — 專案說明

JYTech-Studio 的個人 / 接案作品集網站。用途:**接案展示 + 作品記錄**。
目標讀者多為潛在客戶(非技術背景),但網站本身要能展現工程實力。

- GitHub: `JYTech-Studio/portfolio`(Private)
- 與 `~/Desktop/kaifu-next` 是**完全獨立**的兩個專案,請勿混用。

## 技術棧

- Next.js 16（App Router、Turbopack）+ TypeScript
- Tailwind CSS v4（`@import "tailwindcss"` 寫在 `src/app/globals.css`）
- 內容用 **MDX**：`next-mdx-remote/rsc` 渲染、`gray-matter` 解析 frontmatter
- `@tailwindcss/typography`（案例內文的 `prose` 樣式）
- 預計部署到 **Vercel**

## 專案結構

```
content/projects/*.mdx      ← 作品案例（新增一個 .mdx 就多一篇,網站自動列出）
src/lib/site.ts             ← 個人資訊集中設定（名字 / email / 技能 / GitHub）
src/lib/projects.ts         ← 讀取並排序 content/projects 的案例
src/components/             ← site-header / site-footer / project-card
src/app/page.tsx            ← 首頁（Hero + 精選作品 + 聯絡）
src/app/projects/page.tsx   ← 作品列表
src/app/projects/[slug]/    ← 單一案例頁（渲染 MDX）
src/app/about/page.tsx      ← 關於我
```

## 案例 frontmatter 欄位

`title, slug, summary, role, year, stack[], cover, demoUrl, repoUrl, featured`
（`featured: true` 會出現在首頁精選；`demoUrl`/`repoUrl` 留空時按鈕自動隱藏。）

## 常用指令

- `npm run dev`：開發伺服器（http://localhost:3000）
- `npm run build`：production build（含 TypeScript 檢查）

## 待辦 / 下一步

- [ ] 填 `src/lib/site.ts`：GitHub 連結、技能清單調成實際資料
- [ ] 補 `content/projects/kaifu-next.mdx` 的 `demoUrl` / `repoUrl`
- [ ] 新增更多作品案例
- [ ] 部署到 Vercel（可掛自訂網域）
- [ ] (可選) 把 mailto 換成真正能收訊息的聯絡表單

## 規矩（沿用使用者既有偏好）

- **刪除 / 覆寫檔案前**先說明並等使用者確認。
- **對 GitHub 的寫入操作（push / PR / release 等）前**先確認;唯讀查詢例外。
