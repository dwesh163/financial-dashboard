import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/services/auth";
import { getSpreadsheetMeta } from "@/lib/google/sheets";
import { toSlug } from "@/lib/utils";
import { getSpreadsheetId, SPECIAL_SHEETS } from "@/services/sheets";
import { getSelectedYear } from "@/services/year";

export default async function EventsPage() {
  const session = await getSession();
  const selectedYear = await getSelectedYear();
  const spreadsheetId = await getSpreadsheetId(session.accessToken!, selectedYear);
  const meta = await getSpreadsheetMeta(session.accessToken!, spreadsheetId);
  const eventSheets = meta.sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Liste</p>
        <h1 className="font-mono text-4xl font-bold text-foreground leading-none">Événements</h1>
        <p className="font-mono text-xs text-muted-foreground mt-2">
          {eventSheets.length} événement{eventSheets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      <div className="border border-border">
        {eventSheets.map((sheet, i) => (
          <Link
            key={sheet.sheetId}
            href={`/events/${toSlug(sheet.title)}`}
            className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-[10px] text-muted-foreground/40 w-5 text-right flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {sheet.title}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 group-hover:text-primary transition-colors" />
          </Link>
        ))}
        {eventSheets.length === 0 && (
          <p className="px-5 py-12 font-mono text-sm text-muted-foreground text-center">
            Aucun événement.
          </p>
        )}
      </div>
    </div>
  );
}
