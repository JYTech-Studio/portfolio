# Supabase migrations

這個資料夾放作品集用到的所有資料庫結構（migration）。
每個改動就新增一個 `migrations/NNNN_描述.sql`，照編號順序套用。

## 怎麼套用

不需要裝任何工具，最簡單的方式：

1. 進 [Supabase Dashboard](https://supabase.com/dashboard) → 你的專案 → **SQL Editor**
2. 把 `migrations/` 裡**還沒跑過**的檔案內容貼進去 → **Run**
3. 之後新增的 migration 也照編號依序貼一次即可

> 進階：之後想自動化可改用 [Supabase CLI](https://supabase.com/docs/guides/cli)
> （`supabase db push`），這個資料夾的結構就是 CLI 預期的格式。

## 目前的表

| Migration | 物件 | 用途 |
|---|---|---|
| `0001_portfolio_chat_logs.sql` | `portfolio_chat_logs` | AI 分身聊聊的對話紀錄 |
| `0002_chat_usage_budget.sql` | 同表 + `chat_claude_usage()` | Claude 的 token 用量 / 花費帳本、IP 雜湊與索引；一支 RPC 回傳「本期累計花費」與「這個 IP 近期次數」，給 API 判斷要不要繼續用 Claude |

`0002` 之後 `portfolio_chat_logs` 多了 `model`、`input_tokens`、`output_tokens`、`cost_usd`、`ip_hash` 五個欄位。
`ip_hash` 存的是**加鹽後的 SHA-256**（不是原始 IP），只用來做每日速率限制。

想看目前花了多少：

```sql
select date_trunc('month', created_at) as 月份,
       count(*) as 則數,
       round(sum(cost_usd), 4) as 花費_usd
from portfolio_chat_logs
where provider = 'claude'
group by 1 order by 1 desc;
```

## 環境變數

server 寫入要這兩個（在 Vercel → Settings → Environment Variables 設定；
本機放 `.env.local`）：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` —— service_role 金鑰會繞過 RLS，**只能放 server 端，絕不可外洩**

沒設這兩個就單純不記錄，不影響聊天功能。
