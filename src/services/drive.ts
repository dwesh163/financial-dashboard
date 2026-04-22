"use server";

import { getFolder, uploadFile } from "@/lib/drive";
import { getSelectedYear } from "@/services/auth";
import type { UploadedFile } from "@/types/google";

export const uploadProof = async (formData: FormData): Promise<UploadedFile> => {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Aucun fichier fourni");
  if (file.type !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés");
  const year = await getSelectedYear();
  const financesId = await getFolder({ name: "Finances" });
  const yearId = await getFolder({ name: String(year), parentId: financesId });
  const folderId = await getFolder({ name: "Preuves", parentId: yearId });
  const transactionId = formData.get("transactionId") as string | null;
  const transactionDescription = formData.get("transactionDescription") as string | null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = buildFilename({ transactionId, transactionDescription, originalName: file.name });
  return uploadFile({ folderId, filename, mimeType: file.type, buffer });
};

const buildFilename = ({ transactionId, transactionDescription, originalName }: { transactionId: string | null; transactionDescription: string | null; originalName: string }) => {
  if (!transactionId || !transactionDescription) return originalName;
  const id = transactionId.replace(/#/g, "");
  const name = transactionDescription.toLowerCase().replace(/-/g, "").replace(/\s+/g, "_");
  return `${id}_${name}.pdf`;
};
