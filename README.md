# JYTech-Studio 作品集網站

我的個人 / 接案作品集網站，用來**展示作品、記錄案例**。
讀者多半是潛在客戶（不一定懂技術），所以內容力求好懂；但網站本身也用來展現工程實力。

線上網址：<https://portfolio-sage-six-44.vercel.app>

## 這是什麼

一個用 Next.js 做的作品集網站，主要有幾頁：

- **首頁** — 自我介紹（Hero）+ 精選作品 + 聯絡方式
- **作品列表** — 所有案例
- **單一案例頁** — 每個作品的詳細介紹（用 MDX 撰寫）
- **關於我**

每一篇作品案例就是 `content/projects/` 底下的一個 `.mdx` 檔，**多放一個檔，網站就自動多一篇**，不用改程式碼。

## 用到的技術

- **Next.js（App Router）+ TypeScript** — 網站框架
- **Tailwind CSS v4** — 樣式
- **MDX** — 用 Markdown + 元件寫案例內文（`next-mdx-remote` 渲染、`gray-matter` 讀 frontmatter）
- **Vercel** — 部署（推上 GitHub 會自動上線）

## 怎麼跑起來

```bash
npm install      # 第一次
npm run dev      # 開發伺服器 → http://localhost:3000
npm run build    # 正式打包（會順便做 TypeScript 檢查）
```

## 怎麼新增一篇作品案例

在 `content/projects/` 新增一個 `.mdx` 檔，最上面填欄位（frontmatter），下面用 Markdown 寫內容：

```mdx
---
title: 案例名稱
slug: case-slug              # 網址用，例如 /projects/case-slug
summary: 一句話介紹
role: 我的角色
year: "2026"
stack: [Next.js, PostgreSQL] # 技術標籤
cover: /projects/xxx/cover.jpg
demoUrl: https://...         # 留空則「線上 Demo」按鈕自動隱藏
repoUrl: https://...         # 留空則「原始碼」按鈕自動隱藏
featured: true               # true 會出現在首頁精選
highlights:                  # 卡片上的亮點條列
  - 重點一
  - 重點二
---

## 專案概述
（內文…）
```

封面圖、截圖放在 `public/projects/<slug>/` 底下。

## 專案結構

```
content/projects/*.mdx      作品案例（一個檔 = 一篇）
public/projects/<slug>/     各案例的封面、截圖
src/lib/site.ts             個人資訊集中設定（名字 / email / 技能 / 連結）
src/lib/projects.ts         讀取並排序案例
src/components/             site-header / site-footer / project-card 等
src/app/page.tsx            首頁
src/app/projects/           作品列表 + 單一案例頁
src/app/about/              關於我
tools/covers/               封面產圖工具（見下方）
```

## 封面產圖工具

`tools/covers/` 放的是**產生案例封面用的腳本**（例如鎧福案例那張金棕色地球封面）。
它跟網站完全獨立、不影響建置，只是把封面的「做法」保存下來，方便日後重產或微調。
用法見 [`tools/covers/README.md`](tools/covers/README.md)。

## 部署

推到 GitHub 後由 Vercel 自動建置上線。正式打包前可先在本機 `npm run build` 確認沒問題。
