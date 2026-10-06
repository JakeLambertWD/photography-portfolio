import { router } from "../trpc";
import { followerRouter } from "./follower";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  followers: followerRouter,
});

export type AppRouter = typeof appRouter;
