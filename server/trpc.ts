import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { consumeRateLimit, getClientIp } from "./rateLimit";
import { RATE_LIMITS, type RateLimitName } from "./rateLimit.constants";
import { getSession } from "./session";

// Built for every request by the /api/trpc route handler. Rate limiting reads the client IP from req.
export const createContext = ({ req }: FetchCreateContextFnOptions) => ({ req });

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Looks up the session here rather than in createContext, so public procedures don't pay for a database query.
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getSession();

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, session } });
});

// Add to any procedure with .use(rateLimit("signIn")). Put it before .input() so a flood of
// requests is refused before the input is validated or anything else runs.
export const rateLimit = (name: RateLimitName) =>
  t.middleware(async ({ ctx, next }) => {
    const allowed = await consumeRateLimit(name, getClientIp(ctx.req));

    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Too many attempts. Please try again in ${RATE_LIMITS[name].windowMinutes} minutes.`,
      });
    }

    return next();
  });
