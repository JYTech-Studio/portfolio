-- 0001_portfolio_chat_logs
-- AI 分身聊聊功能的對話紀錄表。
-- server（src/app/api/chat/route.ts）用 SUPABASE_SERVICE_ROLE_KEY 經 PostgREST 寫入。

create table if not exists portfolio_chat_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  question    text,
  answer      text,
  provider    text,
  country     text
);

-- 開 RLS 但「不」建立任何 anon / authenticated 政策：
-- 寫入一律走 service_role key（在 server 端，會繞過 RLS），
-- 因此用公開 anon key 的前端完全讀不到、也寫不到這張表。
alter table portfolio_chat_logs enable row level security;
