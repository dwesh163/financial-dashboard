import { getSelectedYear, getSession } from "@/services/auth";
import { listYearSpreadsheets } from "@/services/spreadsheet";
import packageJson from "../../package.json";

export const getProfileData = async () => {
  const [session, years, selectedYear] = await Promise.all([getSession(), listYearSpreadsheets(), getSelectedYear()]);

  return {
    userName: session.user?.name ?? "",
    userImage: session.user?.image ?? undefined,
    years,
    selectedYear,
    version: packageJson.version,
  };
};
