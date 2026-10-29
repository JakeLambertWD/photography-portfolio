-- The single owner's admin login. Safe to run more than once.
-- singleton_key is the primary key and can only be true, so the table holds at most one row.
-- password_hash must be an argon2 hash (argon2.hash), never a plain password.

create table if not exists admin_credentials (
  singleton_key boolean primary key default true check (singleton_key = true),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
