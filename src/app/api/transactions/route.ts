import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/services/auth";
import type { TransactionType } from "@/services/transactions";
import { addTransaction, deleteTransaction, updateTransaction } from "@/services/transactions";

interface TxPayload {
  date: string;
  type: TransactionType;
  amount: number;
  source: string;
  destination: string;
  person: string;
  description: string;
  proof: string;
}

function validateTx(tx: TxPayload): string | null {
  if (!tx.date || !tx.type) return "Données de transaction invalides";
  if (typeof tx.amount !== "number" || tx.amount <= 0) return "Montant invalide";
  return null;
}

// ─── POST — create ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { spreadsheetId, sheetTitle, transaction: tx } = body;
  if (!spreadsheetId || !sheetTitle) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const err = validateTx(tx);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  await addTransaction(session.accessToken, spreadsheetId, sheetTitle, tx);
  return NextResponse.json({ ok: true });
}

// ─── PATCH — update ───────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { spreadsheetId, sheetTitle, rowIndex, transaction: tx } = body;
  if (!spreadsheetId || !sheetTitle || typeof rowIndex !== "number") {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const err = validateTx(tx);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  await updateTransaction(session.accessToken, spreadsheetId, sheetTitle, rowIndex, tx);
  return NextResponse.json({ ok: true });
}

// ─── DELETE — delete ──────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { spreadsheetId, sheetId, rowIndex } = body;
  if (!spreadsheetId || typeof sheetId !== "number" || typeof rowIndex !== "number") {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  await deleteTransaction(session.accessToken, spreadsheetId, sheetId, rowIndex);
  return NextResponse.json({ ok: true });
}
