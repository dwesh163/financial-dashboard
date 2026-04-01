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
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadFile({ folderId, filename: file.name, mimeType: file.type, buffer });
};
