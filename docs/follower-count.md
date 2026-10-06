# Instagram Follower Count

The site displays my Instagram follower count without calling Instagram
on page load. A daily cron (scheduled job) fetches the count and caches it in Neon;
the frontend reads the cached value.

## Flow

```
Cron (daily ~8am UTC) → route.ts → instagram.ts → Instagram API
                          ↓
                     Neon DB (follower_snapshot)
                          ↓
   tRPC (followers.getCount) → InstagramFollowerCount component
```

## Write path (daily, automatic)

1. **vercel.json** — Vercel Cron sends an authenticated GET request to
   `/api/cron/follower-count` once per day (schedule: `0 8 * * *` — 8:00 UTC;
   on the Hobby plan it may fire any time between 8:00 and 8:59 UTC).
   Auth: Vercel automatically sends `Authorization: Bearer $CRON_SECRET`.

2. **app/api/cron/follower-count/route.ts** — verifies the auth header,
   then calls `getInstagramStats()`. On success, inserts the count as a
   new row in `follower_snapshot` (id and fetched_at are auto-generated
   by Postgres).

3. **lib/instagram.ts** — `getInstagramStats()` reads `IG_USER_ID` and
   `IG_ACCESS_TOKEN` from env, calls the Instagram Graph API, and returns
   the parsed response (we only use `followers_count`).

## Read path (per page visit)

4. **server/routers/follower.ts** — `followers.getCount` queries the
   latest row: `ORDER BY fetched_at DESC LIMIT 1`. Registered in
   `server/routers/_app.ts`, served via `app/api/trpc/[trpc]/route.ts`.

5. **app/components/instagram-followers/InstagramFollowerCount.tsx** —
   calls `api.followers.getCount.useQuery()` and renders the count with
   a spring animation (`AnimatedFollowerNumber`). Rendered in
   `app/layout.tsx` so it appears on every page.

## Setup notes

- Table created by `db/migrations/001_follower_snapshot.sql` (run manually;
  Neon does not auto-run migration files).
- Env vars needed: `DATABASE_URL` (pooled Neon string), `IG_USER_ID`,
  `IG_ACCESS_TOKEN`, `CRON_SECRET`.
- Hobby plan limits cron to once per day, hence daily refresh.
- To force a refresh manually: send an authenticated GET to
  `/api/cron/follower-count` (or run the handler via tsx locally).
