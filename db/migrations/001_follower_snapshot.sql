-- serial means an auto-incrementing integer, typically used for primary keys
-- not null means the column must have a value, it cannot be left empty
-- default now() means the column will automatically be set to the current timestamp so u dont have to provide it

create table if not exists follower_snapshot (
  id serial primary key,
  follower_count integer not null,
  fetched_at timestamptz not null default now()
);

-- create an index on the fetched_at column to speed up queries that order by this column in descending order
create index if not exists follower_snapshot_fetched_at_idx
  on follower_snapshot (fetched_at desc);