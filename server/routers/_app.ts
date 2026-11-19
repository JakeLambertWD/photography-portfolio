import { router } from "../trpc";
import { authRouter } from "./auth";
import { followerRouter } from "./follower";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  auth: authRouter,
  followers: followerRouter,
});

export type AppRouter = typeof appRouter;
