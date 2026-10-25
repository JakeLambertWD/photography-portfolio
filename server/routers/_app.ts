import { router } from "../trpc";
import { authRouter } from "./auth";
import { followerRouter } from "./follower";
import { placesRouter } from "./places";
import { carouselsRouter } from "./carousels";
import { creatorShotsRouter } from "./creatorShots";
import { reelsRouter } from "./reels";
import { shootRouter } from "./shoot";
import { spotsRouter } from "./spots";

// Main application router for TRPC stored endpoints
export const appRouter = router({
  auth: authRouter,
  followers: followerRouter,
  places: placesRouter,
  reels: reelsRouter,
  carousels: carouselsRouter,
  creatorShots: creatorShotsRouter,
  shoot: shootRouter,
  spots: spotsRouter,
});

export type AppRouter = typeof appRouter;
