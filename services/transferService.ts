import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import { sanitizeText } from "@/lib/security/sanitize";
import type { Transfer, TransferType, TransferStatus } from "@/types";

interface GetTransfersOptions {
  limit?: number;
  season?: string;
  type?: TransferType;
  status?: TransferStatus;
}

export async function getTransfers(
  options: GetTransfersOptions = {}
): Promise<Transfer[]> {
  const { limit = 20, season, type, status } = options;
  const db = getAdminDb();

  let query = db
    .collection(COLLECTIONS.TRANSFERS)
    .orderBy("announcedAt", "desc")
    .limit(limit);

  if (season) {
    query = db
      .collection(COLLECTIONS.TRANSFERS)
      .where("season", "==", season)
      .orderBy("announcedAt", "desc")
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transfer[];
}

export async function createTransfer(
  data: Omit<Transfer, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection(COLLECTIONS.TRANSFERS).add({
    ...data,
    playerName: sanitizeText(data.playerName),
    fromClub: sanitizeText(data.fromClub),
    toClub: sanitizeText(data.toClub),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTransfer(
  id: string,
  data: Partial<Transfer>
): Promise<void> {
  const db = getAdminDb();
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.playerName) updateData.playerName = sanitizeText(data.playerName);
  await db.collection(COLLECTIONS.TRANSFERS).doc(id).update(updateData);
}

export async function deleteTransfer(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.TRANSFERS).doc(id).delete();
}
