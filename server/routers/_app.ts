import { TRPCError } from "@trpc/server";
import { sql } from "kysely";
import { db } from "../db";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  health: publicProcedure.query(async () => {
    if (!db) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "DATABASE_URL is not configured.",
      });
    }

    const result = await sql<{ connected: number }>`SELECT 1 AS connected`.execute(db);

    return {
      database: result.rows[0]?.connected === 1 ? "connected" : "unknown",
    } as const;
  }),
});

export type AppRouter = typeof appRouter;