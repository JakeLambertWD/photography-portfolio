import { sql } from "kysely";
import { db } from "./db";
import { RATE_LIMITS, type RateLimitName } from "./rateLimit.constants";

// The visitor's IP address. On Vercel, x-forwarded-for is set by Vercel itself (anything the
// browser sends is overwritten), so it can't be faked. The first entry is the real client.
// Locally it's usually ::1 (localhost), or "unknown" if the header is missing.
export function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Records one attempt and returns true if it's within the limit, or false if it's over.
export async function consumeRateLimit(name: RateLimitName, ip: string) {
  if (!db) {
    throw new Error("Database connection not available.");
  }

  const { limit, windowMinutes } = RATE_LIMITS[name];
  // Postgres works out "has this window expired?" using its own clock, so every server agrees.
  const windowExpired = sql<boolean>`auth_rate_limits.window_start < now() - make_interval(mins => ${windowMinutes})`;

  // One query that does everything, so two requests arriving at once can't both slip through:
  // - First attempt from this IP: insert a row with count 1 (the column defaults).
  // - Row exists and its window has expired: reset to count 1 and start a new window.
  // - Row exists and its window is still open: add 1.
  const { count } = await db
    .insertInto("auth_rate_limits")
    .values({ key: `${name}:${ip}` })
    .onConflict((oc) =>
      oc.column("key").doUpdateSet({
        count: sql<number>`case when ${windowExpired} then 1 else auth_rate_limits.count + 1 end`,
        window_start: sql<Date>`case when ${windowExpired} then now() else auth_rate_limits.window_start end`,
      }),
    )
    .returning("count")
    .executeTakeFirstOrThrow();

  return count <= limit;
}
