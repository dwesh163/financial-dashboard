import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { getSpreadsheetMeta } from "@/lib/sheets";
import { getSelectedYear, getSession } from "@/services/auth";
import { getSpreadsheetId, listYearSpreadsheets } from "@/services/spreadsheet";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const [selectedYear, years] = await Promise.all([getSelectedYear(), listYearSpreadsheets()]);
  const spreadsheetId = await getSpreadsheetId();
  const meta = spreadsheetId ? await getSpreadsheetMeta({ spreadsheetId }) : { sheets: [] };

  return (
    <div className="dark min-h-screen flex bg-background">
      <div className="hidden md:flex">
        <Sidebar
          sheets={meta.sheets}
          userName={session.user?.name ?? session.user?.email ?? ""}
          years={years}
          selectedYear={selectedYear}
        />
      </div>
      <main className="flex-1 px-4 pt-16 pb-20 md:px-8 md:py-8 md:pb-8 overflow-auto min-w-0 md:ml-56">{children}</main>
      <MobileNav />
    </div>
  );
}
