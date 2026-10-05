import { router } from "../trpc";
import { followerRouter } from "./follower";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  follower: followerRouter,
});

export type AppRouter = typeof appRouter;
