import { getInstagramStats } from "@/lib/instagram";
import { db } from "@/server/db";
import { sql } from "kysely";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return Response.json(
      { ok: false, error: "Cron authentication is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  if (!db) {
    return Response.json(
      { ok: false, error: "Database connection is not configured." },
      { status: 503 },
    );
  }

  let stats;
  try {
    stats = await getInstagramStats();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram request failed.";
    return Response.json({ ok: false, error: message }, { status: 502 });
  }

  try {
    // Insert the follower count into the database.
    const inserted = await db
      .insertInto("follower_snapshot")
      .values({ follower_count: stats.followers_count })
      .returning("fetched_at")
      .executeTakeFirstOrThrow();

    // Housekeeping: rate-limit windows last minutes, so rows older than a day are no longer needed.
    // A failure here is only logged, so it never fails the follower-count job.
    await db
      .deleteFrom("auth_rate_limits")
      .where("window_start", "<", sql<Date>`now() - interval '1 day'`)
      .execute()
      .catch((error) => console.error("Failed to clean up auth_rate_limits:", error));

    // Return the inserted follower count and the timestamp it was fetched at.
    return Response.json({
      ok: true,
      count: stats.followers_count,
      fetchedAt: inserted.fetched_at,
    });
  } catch (error) {
    console.error("Failed to store Instagram follower count:", error);
    return Response.json({ ok: false, error: "Failed to store follower count." }, { status: 500 });
  }
}
