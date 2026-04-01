import { ACCOUNTS_SPREADSHEET_PREFIX, FINANCES_FOLDER } from "@/constants/drive";
import { createSpreadsheet, getFolder, searchFiles } from "@/lib/drive";
import { getSelectedYear } from "@/services/auth";

export { SPECIAL_SHEETS } from "@/constants/spreadsheet";

export const getSpreadsheetId = async (): Promise<string> => {
  const year = await getSelectedYear();
  const files = await searchFiles({
    query: `name = '${ACCOUNTS_SPREADSHEET_PREFIX} - ${year}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    pageSize: 1,
  });
  return files[0]?.id ?? "";
};

export const createYearSpreadsheet = async (year: number): Promise<string> => {
  const financesId = await getFolder({ name: FINANCES_FOLDER });
  return createSpreadsheet({ name: `${ACCOUNTS_SPREADSHEET_PREFIX} - ${year}`, parentId: financesId });
};

export const listYearSpreadsheets = async (): Promise<number[]> => {
  const files = await searchFiles({
    query: `name contains '${ACCOUNTS_SPREADSHEET_PREFIX} - ' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    pageSize: 50,
  });
  const years: number[] = [];
  for (const file of files) {
    const match = file.name.match(/Comptes - (\d{4})$/);
    if (match) years.push(Number.parseInt(match[1]!, 10));
  }
  return years.sort((a, b) => b - a);
};
