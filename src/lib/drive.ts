import { Readable } from "node:stream";
import { google } from "googleapis";
import { getTokens } from "@/services/auth";
import type { DriveFile, UploadedFile } from "@/types/google";

const driveClient = async () => {
  const token = await getTokens();
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt * 1000,
  });
  return google.drive({ version: "v3", auth });
};

export const searchFiles = async ({ query, pageSize = 10 }: { query: string; pageSize?: number }) => {
  const drive = await driveClient();
  const res = await drive.files.list({ q: query, fields: "files(id,name)", pageSize });
  return (res.data.files ?? []) as DriveFile[];
};

export const getFolder = async ({ name, parentId }: { name: string; parentId?: string }): Promise<string> => {
  const drive = await driveClient();
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

  if (!created.data.id) throw new Error("Failed to create folder");
  return created.data.id;
};

export const createSpreadsheet = async ({ name, parentId }: { name: string; parentId: string }): Promise<string> => {
  const drive = await driveClient();
  const res = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.spreadsheet", parents: [parentId] },
    fields: "id",
  });
  if (!res.data.id) throw new Error("Failed to create spreadsheet");
  return res.data.id;
};

export const uploadFile = async ({
  folderId,
  filename,
  mimeType,
  buffer,
}: {
  folderId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<UploadedFile> => {
  const drive = await driveClient();
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  const res = await drive.files.create({
    requestBody: { name: filename, mimeType, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: "id,name,webViewLink",
  });

  if (!res.data.id || !res.data.name || !res.data.webViewLink) throw new Error("Failed to upload file");

  return {
    id: res.data.id,
    name: res.data.name,
    webViewLink: res.data.webViewLink,
  };
};
