-- 0002_chat_usage_budget
-- 讓訪客可以自由切換 Claude，但用「花費帳本 + 單一 IP 速率限制」把成本壓在預算內。
-- 1) 對話紀錄多存模型 / token 用量 / 換算後的美金花費 / 訪客 IP 的雜湊
-- 2) 一支 RPC 一次回傳「本期 Claude 累計花費」與「這個 IP 近期用了幾次」

alter table portfolio_chat_logs
  add column if not exists model         text,
  add column if not exists input_tokens  integer,
  add column if not exists output_tokens integer,
  add column if not exists cost_usd      numeric(12, 6) not null default 0,
  -- 只存 IP 的 SHA-256 雜湊（加鹽），不存原始 IP：能做速率限制又不留個資
  add column if not exists ip_hash       text;

create index if not exists portfolio_chat_logs_provider_created_idx
  on portfolio_chat_logs (provider, created_at desc);

create index if not exists portfolio_chat_logs_ip_created_idx
  on portfolio_chat_logs (ip_hash, created_at desc);

-- server 端（service_role）呼叫：POST /rest/v1/rpc/chat_claude_usage
--   p_since    ← 預算期間的起點（例如當月 1 號）
--   p_ip_since ← 速率限制的起點（例如 24 小時前）
create or replace function chat_claude_usage(
  p_ip_hash  text,
  p_since    timestamptz,
  p_ip_since timestamptz
)
returns table (spent_usd numeric, ip_count bigint)
language sql
stable
as $$
  select
    coalesce((
      select sum(cost_usd)
      from portfolio_chat_logs
      where provider = 'claude' and created_at >= p_since
    ), 0)::numeric as spent_usd,
    (
      select count(*)
      from portfolio_chat_logs
      where provider = 'claude'
        and p_ip_hash is not null
        and ip_hash = p_ip_hash
        and created_at >= p_ip_since
    )::bigint as ip_count;
$$;

-- 這支函式只給 server 端的 service_role 用，公開的 anon key 不能呼叫
revoke all on function chat_claude_usage(text, timestamptz, timestamptz) from public;
revoke all on function chat_claude_usage(text, timestamptz, timestamptz) from anon, authenticated;
grant execute on function chat_claude_usage(text, timestamptz, timestamptz) to service_role;
