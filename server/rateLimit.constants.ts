// How many attempts each endpoint allows per IP address, and over how long.
// magicLink is used by the magic-link ticket; it's defined here so all limits live in one place.
export const RATE_LIMITS = {
  signIn: { limit: 5, windowMinutes: 15 },
  magicLink: { limit: 3, windowMinutes: 15 },
} as const;

export type RateLimitName = keyof typeof RATE_LIMITS; // "signIn" | "magicLink"
