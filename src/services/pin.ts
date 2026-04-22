"use server";

import { cookies } from "next/headers";
import { COOKIE_OPTS, LAST_ACTIVE_COOKIE, PIN_HASH_COOKIE } from "@/constants/pin";
import { hashPin, verifyPin } from "@/lib/pin";
import type { PinActionResult } from "@/types/pin";

export const setPin = async ({ pin }: { pin: string }): Promise<PinActionResult> => {
  if (!/^\d{6}$/.test(pin)) return { success: false, error: "Le code doit contenir 6 chiffres" };
  const jar = await cookies();
  jar.set(PIN_HASH_COOKIE, await hashPin(pin), COOKIE_OPTS);
  jar.set(LAST_ACTIVE_COOKIE, Date.now().toString(), COOKIE_OPTS);
  return { success: true };
};

export const unlockWithPin = async ({ pin }: { pin: string }): Promise<PinActionResult> => {
  const jar = await cookies();
  const stored = jar.get(PIN_HASH_COOKIE)?.value;
  if (!stored) return { success: false, error: "Aucun code défini" };
  if (!(await verifyPin(pin, stored))) return { success: false, error: "Code incorrect" };
  jar.set(LAST_ACTIVE_COOKIE, Date.now().toString(), COOKIE_OPTS);
  return { success: true };
};

export const removePin = async (): Promise<PinActionResult> => {
  const jar = await cookies();
  jar.delete(PIN_HASH_COOKIE);
  jar.delete(LAST_ACTIVE_COOKIE);
  return { success: true };
};
