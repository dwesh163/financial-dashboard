import { cache } from "react";
import { Readable } from "stream";
import { driveClient } from "./client";

export type DriveFile = { id: string; name: string };

// ─── Search (memoized per request) ───────────────────────────────────────────

export const searchFiles = cache(async (accessToken: string, query: string, pageSize = 10): Promise<DriveFile[]> => {
  const drive = driveClient(accessToken);
  const res = await drive.files.list({
    q: query,
    fields: "files(id,name)",
    pageSize,
  });
  return (res.data.files ?? []) as DriveFile[];
});

// ─── Folder management ────────────────────────────────────────────────────────

/**
 * Find a folder by name (optionally inside a parent). Creates it if missing.
 */
export async function findOrCreateFolder(accessToken: string, name: string, parentId?: string): Promise<string> {
  const drive = driveClient(accessToken);

  const parentClause = parentId ? ` and '${parentId}' in parents` : "";
  const q = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder'${parentClause} and trashed = false`;

  const res = await drive.files.list({ q, fields: "files(id)", pageSize: 1 });
  if (res.data.files?.[0]?.id) return res.data.files[0].id;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: "id",
  });
  return created.data.id!;
}

/**
 * Resolve (or create) the proof folder:
 *   Finances / {year} / Preuves
 * Returns the folder ID.
 */
export async function getProofFolder(accessToken: string, year: number): Promise<string> {
  const financesId = await findOrCreateFolder(accessToken, "Finances");
  const yearId = await findOrCreateFolder(accessToken, String(year), financesId);
  const preuvesId = await findOrCreateFolder(accessToken, "Preuves", yearId);
  return preuvesId;
}

// ─── File upload ──────────────────────────────────────────────────────────────

export type UploadedFile = {
  id: string;
  name: string;
  webViewLink: string;
};

export async function uploadFile(
  accessToken: string,
  folderId: string,
  filename: string,
  mimeType: string,
  buffer: Buffer,
): Promise<UploadedFile> {
  const drive = driveClient(accessToken);

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      parents: [folderId],
    },
    media: { mimeType, body: stream },
    fields: "id,name,webViewLink",
  });

  return {
    id: res.data.id!,
    name: res.data.name!,
    webViewLink: res.data.webViewLink!,
  };
}
