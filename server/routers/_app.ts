import { router } from "../trpc";
import { followerRouter } from "./follower";
import { placesRouter } from "./places";
import { spotsRouter } from "./spots";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  followers: followerRouter,
  places: placesRouter,
  spots: spotsRouter,
});

export type AppRouter = typeof appRouter;
