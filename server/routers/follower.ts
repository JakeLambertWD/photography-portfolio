import { TRPCError } from "@trpc/server";
import { sql } from "../db";
import { publicProcedure, router } from "../trpc";

export const followerRouter = router({
  getCount: publicProcedure.query(async () => {
    // Check if the SQL client is available before querying the database.
    if (!sql) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "DATABASE_URL is not configured.",
      });
    }

    const rows = await sql`
      select follower_count
      from follower_snapshot
      order by fetched_at desc
      limit 1
    `;

    return rows[0]?.follower_count ?? null;
  }),
});
