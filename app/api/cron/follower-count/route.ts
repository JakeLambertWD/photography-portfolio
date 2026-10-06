import { getInstagramStats } from "@/lib/instagram";
import { sql } from "@/server/db";

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

  if (!sql) {
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
    const inserted = await sql`
      insert into follower_snapshot (follower_count)
      values (${stats.followers_count})
      returning fetched_at
    `;

    // Return the inserted follower count and the timestamp it was fetched at.
    return Response.json({
      ok: true,
      count: stats.followers_count,
      fetchedAt: inserted[0]?.fetched_at,
    });
  } catch (error) {
    console.error("Failed to store Instagram follower count:", error);
    return Response.json({ ok: false, error: "Failed to store follower count." }, { status: 500 });
  }
}
