import { type NextRequest, NextResponse } from "next/server";
import { getProofFolder, uploadFile } from "@/lib/google/drive";
import { auth } from "@/services/auth";
import { getSelectedYear } from "@/services/year";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });
  }

  const year = await getSelectedYear();
  const folderId = await getProofFolder(session.accessToken, year);

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadFile(session.accessToken, folderId, file.name, file.type, buffer);

  return NextResponse.json(uploaded);
}
