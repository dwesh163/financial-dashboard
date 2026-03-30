import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/services/auth";
import { getSpreadsheetMeta, SPREADSHEET_ID } from "@/services/sheets";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const meta = await getSpreadsheetMeta(session.accessToken!, SPREADSHEET_ID);

  return (
    <div className="dark min-h-screen flex bg-background">
      <Sidebar sheets={meta.sheets} userName={session.user?.name ?? session.user?.email ?? ""} />
      <main className="flex-1 px-6 py-6 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
