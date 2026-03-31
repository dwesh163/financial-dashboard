"use server";

import { cookies } from "next/headers";

export async function setYearCookie(year: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("year", String(year), { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
