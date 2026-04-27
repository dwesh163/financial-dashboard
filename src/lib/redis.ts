import { Redis } from "ioredis";

let client: Redis | null = null;

export const getRedis = () => {
  if (!client)
    client = new Redis(process.env.REDIS_URL ?? "redis://localhost:63789", {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
    });
  return client;
};
