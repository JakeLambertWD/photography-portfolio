-- Counts sign-in attempts per IP address. Safe to run more than once.
-- key looks like "signIn:203.0.113.7": the limit's name, then the client IP.
-- window_start is when the current window began; count is the attempts made within it.
-- Rows older than a day are deleted by the daily cron (app/api/cron/follower-count).

create table if not exists auth_rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);
