create table if not exists public.security_rate_limits (
  key text primary key,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);
alter table public.security_rate_limits enable row level security;
revoke all on table public.security_rate_limits from public, anon, authenticated;

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_hits integer;
begin
  if p_key is null or length(p_key) < 8 or p_max < 1 or p_window_seconds < 1 then
    return false;
  end if;
  insert into public.security_rate_limits as limits (key, hits, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
  set hits = case when limits.expires_at <= now() then 1 else limits.hits + 1 end,
      expires_at = case when limits.expires_at <= now() then now() + make_interval(secs => p_window_seconds) else limits.expires_at end
  returning hits into current_hits;
  return current_hits <= p_max;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
