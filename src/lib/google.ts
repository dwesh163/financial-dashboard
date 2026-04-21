import { GaxiosError } from "googleapis-common";
import { redirect } from "next/navigation";

export const withGoogleAuth = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof GaxiosError && (err.status === 401 || err.status === 403)) redirect("/login");
    throw err;
  }
};
