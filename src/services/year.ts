import { cookies } from "next/headers";

export async function getSelectedYear(): Promise<number> {
  const cookieStore = await cookies();
  const val = cookieStore.get("year")?.value;
  return val ? parseInt(val, 10) : new Date().getFullYear();
}
