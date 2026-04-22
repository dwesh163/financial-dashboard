"use server";

import { cookies } from "next/headers";
import { INACTIVITY_THRESHOLD_MS, PIN_HASH_COOKIE } from "@/constants/pin";
import { getProfileData } from "@/services/profile";
import type { SettingsData } from "@/types/settings";

export const getSettingsData = async (): Promise<SettingsData> => {
  const [profile, jar] = await Promise.all([getProfileData(), cookies()]);
  return {
    ...profile,
    isPinSet: jar.has(PIN_HASH_COOKIE),
    inactivityThresholdMs: INACTIVITY_THRESHOLD_MS,
  };
};
