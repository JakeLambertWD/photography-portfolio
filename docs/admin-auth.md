# Admin Authentication: Cookie Session Flows

Admin pages under `/collaborate` are protected by a database-backed session.
The client holds a random token in an HTTP-only cookie (`admin_session`); the
database only stores its SHA-256 hash.

Each screenshot below is a screen the browser ends on, with the routes that
lead to it.

## Sign-in form

- `/collaborate/signin` with no valid session: the form renders.
- `/collaborate` (or any protected path) with no cookie: the proxy redirects
  to `/collaborate/signin`.
- `/collaborate` with an expired or forged cookie: `verifySession()` redirects
  to `/collaborate/signin`.
- Sign out on `/collaborate`: `router.replace("/collaborate/signin")`.

![Admin sign-in form](images/admin-auth/signin.png)

## Request page

- `/collaborate/request`: a public path, so the proxy lets it through with or
  without a cookie.

![Collaboration request placeholder page](images/admin-auth/request.png)

## 404 page

- `/collaborate/review`: a public path, so the proxy lets it through, but no
  page exists there yet.

![Default 404 page for /collaborate/review](images/admin-auth/review-404.png)

## Sign-in form: validation error

- Submitting the form on `/collaborate/signin` with an empty or invalid email:
  Zod stops it in the browser, so no request is sent.

![Sign-in form showing Enter a valid email address](images/admin-auth/signin-validation-error.png)

## Sign-in form: wrong email or password

- Submitting the form on `/collaborate/signin` with a wrong email or password:
  `POST /api/trpc/auth.signIn` returns `UNAUTHORIZED`.

![Sign-in form showing Invalid email or password](images/admin-auth/signin-wrong-password.png)

## How the cookie works

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Next.js server
    participant D as Database

    Note over C,D: 1. Sign in
    C->>S: POST /api/trpc/auth.signIn (email + password)
    S->>D: Find admin by email, verify password with argon2
    S->>D: Insert SHA-256(token), expires in 7 days
    S-->>C: Set-Cookie: admin_session=token (httpOnly, secure, sameSite=lax, 7 days)

    Note over C,D: 2. Use the site
    C->>S: GET /collaborate + Cookie: admin_session=token
    Note right of S: Proxy: cookie present? No DB call
    S->>D: verifySession(): find SHA-256(token), not expired?
    S-->>C: 200 admin page

    Note over C,D: 3. Sign out
    C->>S: POST /api/trpc/auth.signOut + Cookie: admin_session=token
    S->>D: Delete session row
    S-->>C: Clear the cookie, then replace to /collaborate/signin
```

The client only ever holds the raw token, and the database only stores its
SHA-256 hash, so a leaked sessions table can't be used to sign in. The proxy
does a cheap cookie check on every request; `verifySession()` does the real
database check before an admin page renders.

## Rate limiting

Sign-in attempts are limited per IP address, so passwords can't be guessed
without limit. The limits live in `server/rateLimit/rateLimit.constants.ts`:

| Endpoint                              | Limit                     |
| ------------------------------------- | ------------------------- |
| `auth.signIn`                         | 5 attempts per 15 minutes |
| `auth.requestMagicLink` (coming next) | 3 requests per 15 minutes |

- The `rateLimit(name)` tRPC middleware runs before the input is validated
  and before the password check. Over the limit, it throws
  `TOO_MANY_REQUESTS` (HTTP 429), and the form shows "Too many attempts.
  Please try again in 15 minutes." under the button.
- Counts live in the `auth_rate_limits` table, one row per `name:ip`
  (`db/migrations/015_auth_rate_limits.sql`). A single
  `INSERT … ON CONFLICT DO UPDATE` adds 1, or starts a new window once the
  old one has expired, so simultaneous requests can't slip past the limit.
- The IP comes from the first entry of `x-forwarded-for`, which Vercel sets
  itself. Locally it's `::1`.
- The daily cron deletes rows older than a day.
- To unblock yourself while testing, run `delete from auth_rate_limits;` in
  the Neon SQL Editor.

## Where the code lives

- **proxy.ts** — cookie-only check for every request under `/collaborate`.
- **server/session/session.ts** — `createSession()`, `getSession()`,
  `verifySession()`, `redirectIfSignedIn()`, `deleteSession()`.
- **server/trpc/routers/auth.ts** — `auth.signIn` and `auth.signOut` mutations.
- **server/trpc/trpc.ts** — `protectedProcedure` guards admin tRPC calls, which the
  proxy doesn't cover.
- **server/trpc/trpc.ts** — `rateLimit(name)` middleware limits attempts per IP.
- **server/rateLimit/rateLimit.ts** — `consumeRateLimit()` and `getClientIp()`; the
  limits themselves are in **server/rateLimit/rateLimit.constants.ts**.
