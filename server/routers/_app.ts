import { router } from "../trpc";
import { followerRouter } from "./follower";
import { placesRouter } from "./places";
import { reelsRouter } from "./reels";
import { spotsRouter } from "./spots";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  followers: followerRouter,
  places: placesRouter,
  reels: reelsRouter,
  spots: spotsRouter,
});

export type AppRouter = typeof appRouter;
