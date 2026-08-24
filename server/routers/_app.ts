import { TRPCError } from "@trpc/server";
import { sql } from "../db";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  health: publicProcedure.query(async () => {
    if (!sql) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "DATABASE_URL is not configured.",
      });
    }

    const result = await sql`SELECT 1 AS connected`;

    return {
      database: result[0]?.connected === 1 ? "connected" : "unknown",
    } as const;
  }),
});

export type AppRouter = typeof appRouter;