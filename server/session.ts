import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { db } from "./db";
import { SESSION_COOKIE_NAME } from "./session.constants";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// The database stores this hash, never the raw token, so a leaked table can't be used to sign in.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Starts an admin session and sends its token to the browser.
// Shared by password and magic-link sign-in so both produce the same kind of session.
export async function createSession() {
  if (!db) {
    throw new Error("Database connection not available.");
  }

  // Generate a new random session token
  const token = randomBytes(32).toString("base64url"); // i.e. R3mQ8vN2xKpL5yTjD7aWcF1sH9uB4eZgM6iO0lXqYkA
  // Calculate the expiration date (7 days from now) for the session
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Store the session (fingerprint) in the DB w/ the hashed token and expiration date.
  await db
    .insertInto("admin_sessions")
    .values({ id: hashToken(token), expires_at: expiresAt })
    .execute();

  // Get the cookie store for the current request to set the session cookie.
  const cookieStore = await cookies();
  // Set the session cookie with the token and expiration date.
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Returns the current session, or null when the cookie is missing, unknown or expired.
export async function getSession() {
  // Get the session token from the cookie store for the current request.
  const cookieStore = await cookies();
  // Retrieve the session token from the cookie.
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // If the token is missing or the database connection is unavailable, return null.
  if (!token || !db) {
    return null;
  }

  // Query the database for a session matching the hashed token and not expired.
  const session = await db
    .selectFrom("admin_sessions")
    .select(["id", "expires_at"])
    .where("id", "=", hashToken(token))
    .where("expires_at", ">", new Date())
    .executeTakeFirst();

  return session ?? null;
}

// For admin pages: returns the session, or redirects to sign-in when there isn't a valid one.
// cache() means several calls during one render share a single database query.
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session) {
    redirect("/collaborate/signin");
  }

  return session;
});

// For the sign-in page: sends an already signed-in admin straight to /collaborate.
// Checks the database rather than just the cookie, so an expired cookie can't cause a redirect loop.
export async function redirectIfSignedIn() {
  if (await getSession()) {
    redirect("/collaborate");
  }
}

// Signs the admin out: removes the session row so the token stops working, then clears the cookie.
export async function deleteSession() {
  // Get the session token from the cookie store for the current request.
  const cookieStore = await cookies();
  // Retrieve the session token from the cookie.
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // If the token exists and the database connection is available, delete the session from the database.
  if (token && db) {
    await db.deleteFrom("admin_sessions").where("id", "=", hashToken(token)).execute();
  }

  // Clear the session cookie from the browser.
  cookieStore.delete(SESSION_COOKIE_NAME);
}
