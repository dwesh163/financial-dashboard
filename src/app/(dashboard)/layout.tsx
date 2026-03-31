import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { getSpreadsheetMeta } from "@/lib/google/sheets";
import { getSession } from "@/services/auth";
import { getSpreadsheetId, listYearSpreadsheets } from "@/services/sheets";
import { getSelectedYear } from "@/services/year";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const [selectedYear, years] = await Promise.all([getSelectedYear(), listYearSpreadsheets(session.accessToken!)]);
  const spreadsheetId = await getSpreadsheetId(session.accessToken!, selectedYear);
  const meta = await getSpreadsheetMeta(session.accessToken!, spreadsheetId);

  return (
    <div className="dark min-h-screen flex bg-background">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar
          sheets={meta.sheets}
          userName={session.user?.name ?? session.user?.email ?? ""}
          years={years}
          selectedYear={selectedYear}
        />
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-auto min-w-0 pb-20 md:pb-8 md:ml-48">{children}</main>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  );
}
