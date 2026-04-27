import { cacheKey, getCache, setCache } from "@/lib/cache";
import { getSelectedYear, getSession } from "@/services/auth";
import { getContactsFresh } from "@/services/contacts";
import { getEventDataFresh, getEventSheetsFresh } from "@/services/events";
import { getSummaryFresh } from "@/services/summary";
import type { RefreshType } from "@/types/cache";

const encoder = new TextEncoder();

const sseEvent = (event: string) => encoder.encode(`event: ${event}\ndata: {}\n\n`);

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as RefreshType | null;
  const slug = url.searchParams.get("slug") ?? undefined;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(sseEvent("checking"));

        const [session, year] = await Promise.all([getSession(), getSelectedYear()]);
        const userId = session.user?.id;

        let changed = false;

        if (type === "summary") {
          const [fresh, cached] = await Promise.all([getSummaryFresh(), getCache(cacheKey.summary(userId, year))]);
          if (cached === null || JSON.stringify(fresh) !== JSON.stringify(cached)) {
            await setCache(cacheKey.summary(userId, year), fresh);
            if (cached !== null) changed = true;
          }
        } else if (type === "events") {
          const [fresh, cached] = await Promise.all([getEventSheetsFresh(), getCache(cacheKey.events(userId, year))]);
          if (cached === null || JSON.stringify(fresh) !== JSON.stringify(cached)) {
            await setCache(cacheKey.events(userId, year), fresh);
            if (cached !== null) changed = true;
          }
        } else if (type === "event" && slug) {
          const [fresh, cached] = await Promise.all([
            getEventDataFresh({ slug }),
            getCache(cacheKey.event(userId, year, slug)),
          ]);
          if (fresh && (cached === null || JSON.stringify(fresh) !== JSON.stringify(cached))) {
            await setCache(cacheKey.event(userId, year, slug), fresh);
            if (cached !== null) changed = true;
          }
        } else if (type === "contacts") {
          const [fresh, cached] = await Promise.all([getContactsFresh(), getCache(cacheKey.contacts(userId))]);
          if (cached === null || JSON.stringify(fresh) !== JSON.stringify(cached)) {
            await setCache(cacheKey.contacts(userId), fresh);
            if (cached !== null) changed = true;
          }
        }

        controller.enqueue(sseEvent(changed ? "changed" : "no-change"));
      } catch {
        controller.enqueue(sseEvent("error"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
};
