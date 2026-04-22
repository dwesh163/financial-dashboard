import { INACTIVITY_THRESHOLD_MS } from "@/constants/pin";

export const hashPin = async (pin: string): Promise<string> => {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(salt + pin));
  const hash = Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${salt}:${hash}`;
};

export const verifyPin = async (pin: string, stored: string): Promise<boolean> => {
  const colon = stored.indexOf(":");
  if (colon === -1) return false;
  const salt = stored.slice(0, colon);
  const hash = stored.slice(colon + 1);
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(salt + pin));
  const computed = Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
  return computed === hash;
};

export const isStale = (lastActive: string | undefined): boolean => {
  if (!lastActive) return true;
  const ts = Number(lastActive);
  return Number.isNaN(ts) || Date.now() - ts > INACTIVITY_THRESHOLD_MS;
};
