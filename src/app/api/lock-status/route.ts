import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LAST_ACTIVE_COOKIE, PIN_HASH_COOKIE } from "@/constants/pin";
import { isStale } from "@/lib/pin";

export const GET = async () => {
  const jar = await cookies();
  const pinHash = jar.get(PIN_HASH_COOKIE)?.value;
  const lastActive = jar.get(LAST_ACTIVE_COOKIE)?.value;
  const locked = pinHash !== undefined && isStale(lastActive);
  return NextResponse.json({ locked });
};
