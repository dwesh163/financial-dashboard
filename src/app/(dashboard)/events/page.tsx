import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/services/auth";
import { getSpreadsheetMeta, SPECIAL_SHEETS, SPREADSHEET_ID, toSlug } from "@/services/sheets";

export default async function EventsPage() {
  const session = await getSession();
  const meta = await getSpreadsheetMeta(session.accessToken!, SPREADSHEET_ID);
  const eventSheets = meta.sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <h1 className="text-xl font-bold text-foreground">Événements</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{eventSheets.length} événements</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {eventSheets.map((sheet) => (
          <Link
            key={sheet.sheetId}
            href={`/events/${toSlug(sheet.title)}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-0 active:bg-muted/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{sheet.title}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          </Link>
        ))}
        {eventSheets.length === 0 && (
          <p className="px-4 py-10 text-sm text-muted-foreground text-center">Aucun événement.</p>
        )}
      </div>
    </div>
  );
}
