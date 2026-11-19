-- Signed-in admin sessions. Safe to run more than once.
-- id is the SHA-256 hash of the session token; the raw token only ever lives in the cookie,
-- so a leaked copy of this table can't be used to sign in.

create table if not exists admin_sessions (
  id text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
