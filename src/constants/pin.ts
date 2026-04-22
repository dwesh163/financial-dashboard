export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
} as const;

export const PIN_HASH_COOKIE = "__pin_h";
export const LAST_ACTIVE_COOKIE = "__pin_la";
export const INACTIVITY_THRESHOLD_MS = 10 * 60 * 1000;
