import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SPECIAL_SHEETS } from "@/constants/spreadsheet";
import { getSpreadsheetMeta } from "@/lib/sheets";
import { toSlug } from "@/lib/utils";
import { getSpreadsheetId } from "@/services/spreadsheet";

export default async function EventsPage() {
  const spreadsheetId = await getSpreadsheetId();
  const meta = spreadsheetId ? await getSpreadsheetMeta({ spreadsheetId }) : { sheets: [] };
  const eventSheets = meta.sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));
  const count = eventSheets.length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Liste" title="Événements" subtitle={`${count} événement${count !== 1 ? "s" : ""}`} />

      <div className="border border-border">
        {eventSheets.map((sheet, i) => (
          <Link
            key={sheet.sheetId}
            href={`/events/${toSlug(sheet.title)}`}
            className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-white/4 transition-colors group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-[10px] text-muted-foreground/40 w-5 text-right shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {sheet.title}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-primary transition-colors" />
          </Link>
        ))}
        {count === 0 && (
          <p className="px-5 py-12 font-mono text-sm text-muted-foreground text-center">Aucun événement.</p>
        )}
      </div>
    </div>
  );
}
