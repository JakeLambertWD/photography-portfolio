import { router } from "../trpc";
import { followerRouter } from "./follower";
import { placesRouter } from "./places";
import { carouselsRouter } from "./carousels";
import { reelsRouter } from "./reels";
import { shootRouter } from "./shoot";
import { spotsRouter } from "./spots";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  followers: followerRouter,
  places: placesRouter,
  reels: reelsRouter,
  carousels: carouselsRouter,
  shoot: shootRouter,
  spots: spotsRouter,
});

export type AppRouter = typeof appRouter;
