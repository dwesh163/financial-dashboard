import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/services/auth";
import { getSpreadsheetMeta, SPREADSHEET_ID } from "@/services/sheets";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const meta = await getSpreadsheetMeta(session.accessToken!, SPREADSHEET_ID);

  return (
    <div className="dark min-h-screen flex bg-background">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar sheets={meta.sheets} userName={session.user?.name ?? session.user?.email ?? ""} />
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-5 md:px-6 md:py-6 overflow-auto min-w-0 pb-24 md:pb-6">{children}</main>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  );
}
