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
- **AI 分身聊聊** — 右下角浮動泡泡，訪客可以跟「依我履歷回答的 AI」對話（見下方）

每一篇作品案例就是 `content/projects/` 底下的一個 `.mdx` 檔，**多放一個檔，網站就自動多一篇**，不用改程式碼。

## 用到的技術

- **Next.js（App Router）+ TypeScript** — 網站框架
- **Tailwind CSS v4** — 樣式
- **MDX** — 用 Markdown + 元件寫案例內文（`next-mdx-remote` 渲染、`gray-matter` 讀 frontmatter）
- **LLM（AI 分身）** — Gemini（預設、免費）與 Claude（`@anthropic-ai/sdk`）；訪客可自由切換，Claude 有花費上限保護
- **Supabase** — 記錄 AI 分身的對話 + Claude 花費帳本
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
src/lib/persona.ts          AI 分身的人設 + 履歷（知識來源）
src/components/             site-header / site-footer / project-card / ai-chat 等
src/app/api/chat/route.ts   AI 分身的後端 API
src/app/page.tsx            首頁
src/app/projects/           作品列表 + 單一案例頁
src/app/about/              關於我
supabase/                   資料庫 migration（對話紀錄表）
tools/covers/               封面產圖工具（見下方）
```

## AI 分身聊聊

右下角的浮動泡泡，讓訪客（例如面試官）可以跟「**依我的履歷回答的 AI**」對話，
等於跟虛擬的我聊技術棧、做過的專案、工作方式。

**運作方式**

- 履歷整段塞進 LLM 的 system prompt（履歷很短，不需要 RAG），找不到答案會誠實說「資料裡沒提到」並請對方 email
- 回答的 LLM：預設 **Gemini**（免費），訪客可以自己切換到 **Claude** 比較看看
- 對話可選擇性寫進 **Supabase**（`portfolio_chat_logs` 表），這樣我能知道別人都問了什麼。沒設定就單純不記錄，不影響聊天

**Claude 開放給訪客切換，怎麼不會燒錢？** 三層防護：

| 層 | 做法 | 擋掉什麼 |
|---|---|---|
| 1. Anthropic Console | 另開一個 Workspace 設**每月支出上限 $1**，網站只用那把 key | 程式出 bug 也不可能超支（唯一的硬保證） |
| 2. 預算帳本 | 每則 Claude 回答把 token 用量換算成美金寫進 `portfolio_chat_logs.cost_usd`；本期累計達 `CLAUDE_BUDGET_USD` 就自動改用 Gemini 並跟訪客說明 | 正常情況下根本碰不到第 1 層 |
| 3. 速率限制 | 同一個 IP（存 SHA-256 雜湊，不留原始 IP）24 小時最多 `CLAUDE_DAILY_LIMIT_PER_IP` 則 Claude | 一個人一次把整期額度刷光 |

再加上省錢細節：Claude 走最便宜的 **Haiku 4.5**（$1 / $5 每百萬 token）、輸出上限 800 token、只帶最近 8 則歷史，
履歷 system prompt 開 **prompt caching**（5 分鐘內連續提問，輸入只算 1 成價錢）。
以 Haiku 單價估算，一則約 **$0.003**，$1 大約可以回答 **300 則**（實際看提問長度）。

管理密鑰（`CHAT_ADMIN_TOKEN`）不再是「解鎖 Claude」，而是「不受上限限制」——
自己用網址帶一次 `?chatKey=<密鑰>` 開啟網站即可（存進 localStorage），訪客完全不需要。

**相關檔案**

- `src/lib/persona.ts` — AI 分身的人設 + 履歷（知識來源）
- `src/app/api/chat/route.ts` — 後端 API（呼叫 LLM、預算把關、寫紀錄）
- `src/lib/chat-budget.ts` — Claude 花費換算、預算與速率限制
- `src/components/ai-chat.tsx` — 前端浮動聊天視窗
- `supabase/` — 對話紀錄表的 migration（見 [`supabase/README.md`](supabase/README.md)）

**環境變數**（本機放 `.env.local`，線上在 Vercel → Settings → Environment Variables 設定；
範例見 [`.env.local.example`](.env.local.example)）

| 變數 | 必填 | 用途 |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | 訪客用的免費模型（[AI Studio](https://aistudio.google.com/apikey) 申請） |
| `GEMINI_MODEL` | | 預設 `gemini-2.5-flash-lite` |
| `ANTHROPIC_API_KEY` | | 要開放 Claude 才需要（建議用有月支出上限的 Workspace key） |
| `CLAUDE_MODEL` | | 預設 `claude-haiku-4-5` |
| `CLAUDE_MAX_TOKENS` | | Claude 單則輸出上限，預設 800 |
| `CLAUDE_BUDGET_USD` | | Claude 本期預算（美金），預設 `1`；達標後自動改用 Gemini |
| `CLAUDE_BUDGET_WINDOW` | | `month`（預設，每月 1 號重置）或 `total` |
| `CLAUDE_DAILY_LIMIT_PER_IP` | | 同一 IP 每日 Claude 上限，預設 `10`；`0` 為不限 |
| `CHAT_IP_SALT` | | IP 雜湊用的鹽（沒設會沿用 service_role key） |
| `CHAT_ADMIN_TOKEN` | | 我自己用：帶這組密鑰的請求不受預算 / 速率限制 |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | | 對話紀錄與**花費帳本**（service_role 金鑰只能放 server，勿外洩） |

> 上線前記得到 Supabase 跑一次 `supabase/migrations/` 把表和 `chat_claude_usage` 函式建起來。
> 沒接 Supabase 時，花費只能靠單一 serverless 實例的記憶體粗估（多實例會低估），
> 這種情況請務必依賴 Console 的月支出上限。

## 封面產圖工具

`tools/covers/` 放的是**產生案例封面用的腳本**（例如鎧福案例那張金棕色地球封面）。
它跟網站完全獨立、不影響建置，只是把封面的「做法」保存下來，方便日後重產或微調。
用法見 [`tools/covers/README.md`](tools/covers/README.md)。

## 部署

推到 GitHub 後由 Vercel 自動建置上線。正式打包前可先在本機 `npm run build` 確認沒問題。
