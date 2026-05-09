import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import type { StandingEntry } from "@/types";

interface GetStandingsOptions {
  season?: string;
  limit?: number;
}

export async function getStandings(
  options: GetStandingsOptions = {}
): Promise<StandingEntry[]> {
  const { season = "2024-2025", limit = 20 } = options;
  const db = getAdminDb();

  const snapshot = await db
    .collection(COLLECTIONS.STANDINGS)
    .where("season", "==", season)
    .orderBy("position", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StandingEntry[];
}

export async function upsertStandingEntry(
  entry: Omit<StandingEntry, "id" | "updatedAt">
): Promise<void> {
  const db = getAdminDb();

  // Find existing entry for this team/season
  const existing = await db
    .collection(COLLECTIONS.STANDINGS)
    .where("teamId", "==", entry.teamId)
    .where("season", "==", entry.season)
    .limit(1)
    .get();

  if (existing.empty) {
    await db.collection(COLLECTIONS.STANDINGS).add({
      ...entry,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await existing.docs[0].ref.update({
      ...entry,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function deleteStandingEntry(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.STANDINGS).doc(id).delete();
}
