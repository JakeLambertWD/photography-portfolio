import { SESSION_COOKIE_NAME } from "@/server/session.constants";
import { NextResponse, type NextRequest } from "next/server";

// Pages under /collaborate that anyone can open without signing in.
const PUBLIC_PATHS = [
  "/collaborate/signin",
  "/collaborate/review",
  "/collaborate/request",
] as const;

// Next.js runs this proxy automatically before every HTTP request that matches config.matcher, including page
// loads, client-side navigations and <Link> prefetches. Nothing imports it; Next.js finds it by its
// file name and export name. tRPC calls (/api/trpc) don't match, so protectedProcedure guards those.

// It only checks that a session cookie exists, without querying the database, because it also runs
// for every prefetch. Admin pages call verifySession() to validate the session properly.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Public pages and requests with a session cookie allow the request to continue
  if (isPublic || request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.next();
  }

  // Otherwise, redirect to the sign in page
  return NextResponse.redirect(new URL("/collaborate/signin", request.url));
}

// Covers /collaborate and every path under it. Next.js reads this at build time, so it must be a
// literal value, not a variable.
export const config = {
  matcher: "/collaborate/:path*",
};
