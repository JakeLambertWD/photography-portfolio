import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { publicProcedure, router } from "../trpc";

export const followerRouter = router({
  getCount: publicProcedure.query(async () => {
    // Check if the database client is available before querying the database.
    if (!db) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "DATABASE_URL is not configured.",
      });
    }

    const latest = await db
      .selectFrom("follower_snapshot")
      .select("follower_count")
      .orderBy("fetched_at", "desc")
      .executeTakeFirst();

    return latest?.follower_count ?? null;
  }),
});
