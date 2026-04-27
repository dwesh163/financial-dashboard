import { getRedis } from "@/lib/redis";

const CACHE_TTL = 900; // 15 minutes

export const cacheKey = {
  summary: (userId: string, year: number) => `cache:summary:${userId}:${year}`,
  events: (userId: string, year: number) => `cache:events:${userId}:${year}`,
  event: (userId: string, year: number, slug: string) => `cache:event:${userId}:${year}:${slug}`,
  contacts: (userId: string) => `cache:contacts:${userId}`,
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await getRedis().get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setCache = async <T>(key: string, value: T, ttl = CACHE_TTL): Promise<void> => {
  try {
    await getRedis().set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // cache errors must not break the app
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await getRedis().del(key);
  } catch {
    // ignore
  }
};
