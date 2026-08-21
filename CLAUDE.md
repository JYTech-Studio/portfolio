@AGENTS.md

# Portfolio — 專案說明

JYTech-Studio 的個人 / 接案作品集網站。用途:**接案展示 + 作品記錄**。
目標讀者多為潛在客戶(非技術背景),但網站本身要能展現工程實力。

- GitHub: `JYTech-Studio/portfolio`(Private)
- 線上：https://portfolio-sage-six-44.vercel.app （push 到 main 由 Vercel 自動部署）
- 與 `~/Desktop/kaifu-next` 是**完全獨立**的兩個專案,請勿混用。

## 技術棧

- Next.js 16（App Router、Turbopack）+ TypeScript
- Tailwind CSS v4（`@import "tailwindcss"` 寫在 `src/app/globals.css`）
- 內容用 **MDX**：`next-mdx-remote/rsc` 渲染、`gray-matter` 解析 frontmatter
- `@tailwindcss/typography`（案例內文的 `prose` 樣式）
- **LLM**：Google Gemini（預設、免費）與 Anthropic Claude（`@anthropic-ai/sdk`，訪客可切換）
- **Supabase**（PostgreSQL）：AI 分身的對話紀錄與 Claude 花費帳本
- 部署在 **Vercel**（Function Region 設 `sin1`，與 Supabase 專案同在新加坡）

## 專案結構

```
content/projects/*.mdx      ← 作品案例（新增一個 .mdx 就多一篇,網站自動列出）
src/lib/site.ts             ← 個人資訊集中設定（名字 / email / 技能 / GitHub）
src/lib/projects.ts         ← 讀取並排序 content/projects 的案例
src/lib/persona.ts          ← AI 分身的人設 + 整份履歷（LLM 的知識來源）
src/lib/chat-budget.ts      ← Claude 花費換算、預算與速率限制
src/app/api/chat/route.ts   ← AI 分身後端（呼叫 LLM、預算把關、寫紀錄）
src/components/             ← site-header / site-footer / project-card / ai-chat
src/app/page.tsx            ← 首頁（Hero + 精選作品 + 聯絡）
src/app/projects/page.tsx   ← 作品列表
src/app/projects/[slug]/    ← 單一案例頁（渲染 MDX）
src/app/about/page.tsx      ← 關於我
supabase/migrations/        ← 資料庫 migration（手動貼進 Supabase SQL Editor 執行）
tools/covers/               ← 案例封面產圖工具（與網站獨立，見該資料夾 README）
```

## 案例 frontmatter 欄位

`title, slug, summary, role, year, stack[], cover, demoUrl, repoUrl, featured, highlights[]`
（`featured: true` 會出現在首頁精選；`cover`/`demoUrl`/`repoUrl` 留空時該區塊自動隱藏。）

## AI 分身聊聊（成本敏感，改動前先看這段）

右下角的浮動聊天。履歷整段塞進 system prompt（夠小,**不需要 RAG**）,
訪客可自由切換 Gemini（免費、預設）或 Claude（付費）。

Claude 開放給所有訪客,靠三層控管把成本關住:

1. **帳戶層**：Anthropic Console 關閉自動儲值 + 月支出上限（唯一的硬保證）
2. **預算帳本**：每則回答把 token 用量換算成美金寫進 `portfolio_chat_logs.cost_usd`,
   本期累計達 `CLAUDE_BUDGET_USD`（預設 $1）就自動改用 Gemini 並跟訪客說明
3. **速率限制**：同一 IP（存加鹽 SHA-256 雜湊,不留原始 IP）24 小時上限
   `CLAUDE_DAILY_LIMIT_PER_IP`（預設 10 則）

⚠️ **改這裡之前請三思**：

- **不要隨手換 `CLAUDE_MODEL`**。預設 `claude-haiku-4-5` 是 $1/$5 每百萬 token;
  換成 Opus 是 $5/$25,同樣預算能回答的則數直接砍到 1/5。
- **不要拿掉 system prompt 的 `cache_control`**。履歷每次都一樣,靠 prompt caching
  讓 5 分鐘內的後續提問輸入成本只算一成。
- **不要放寬 `CLAUDE_MAX_TOKENS` 或帶入的歷史則數**（目前 800 token / 最近 8 則),
  那是壓低單則成本的主要手段。
- 花費換算表在 `src/lib/chat-budget.ts` 的 `PRICING`,**改模型時要一起更新單價**,
  否則帳本會算錯。表裡沒有的模型會用最貴的單價估（寧可高估提早停用）。
- 記錄失敗、Supabase 逾時**都不能影響聊天本身**（目前查詢設 2 秒 timeout 就放棄）。

環境變數清單見 `.env.local.example`;資料表與 RPC 見 `supabase/README.md`。

## 常用指令

- `npm run dev`：開發伺服器（http://localhost:3000）
- `npm run build`：production build（含 TypeScript 檢查）

## 待辦 / 下一步

- [ ] Anthropic Console 設月支出上限（建議 $2,比 `CLAUDE_BUDGET_USD` 高一點,
      讓程式層先跳；Console 那層純粹當程式壞掉時的最後防線）+ 設 $1 的 email 通知
- [ ] `CHAT_ADMIN_TOKEN` 換長一點（目前偏短,它的權限是「不受花費上限」）
- [ ] 新增更多作品案例
- [ ] 掛自訂網域（目前是 Vercel 預設網址,`src/lib/site.ts` 的 `url` 要一起改）
- [ ] (可選) 把 mailto 換成真正能收訊息的聯絡表單
- [ ] (可選) `/admin/chats` 後台看對話紀錄——**先別做**,Supabase Dashboard
      存幾個常用查詢就夠了;等真的常看再說

已完成:填 `site.ts`、部署 Vercel、AI 分身聊聊 + 三層成本控管。
（`kaifu-next.mdx` 的 `repoUrl` 刻意留空——那是客戶案子,repo 不公開。）

## 規矩（沿用使用者既有偏好）

- **刪除 / 覆寫檔案前**先說明並等使用者確認。
- **對 GitHub 的寫入操作（push / PR / release 等）前**先確認;唯讀查詢例外。
