import { NextResponse } from "next/server";
import { cacheKey, setCache } from "@/lib/cache";
import { toSlug } from "@/lib/utils";
import { getSelectedYear, getSession } from "@/services/auth";
import { getContactsFresh } from "@/services/contacts";
import { getEventDataFresh, getEventSheetsFresh } from "@/services/events";
import { getSummaryFresh } from "@/services/summary";

export const POST = async () => {
  try {
    const [session, year] = await Promise.all([getSession(), getSelectedYear()]);
    const userId = session.user?.id;

    const [summary, eventSheets, contacts] = await Promise.all([
      getSummaryFresh(),
      getEventSheetsFresh(),
      getContactsFresh(),
    ]);

    await Promise.all([
      setCache(cacheKey.summary(userId, year), summary),
      setCache(cacheKey.events(userId, year), eventSheets),
      setCache(cacheKey.contacts(userId), contacts),
    ]);

    await Promise.all(
      eventSheets.map(async (sheet) => {
        const slug = toSlug(sheet.title);
        const data = await getEventDataFresh({ slug });
        if (data) await setCache(cacheKey.event(userId, year, slug), data);
      }),
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
