import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Match, MatchStatus, MatchScore } from "@/types";

interface GetMatchesOptions {
  limit?: number;
  season?: string;
  status?: MatchStatus;
}

export async function getUpcomingMatches(
  options: GetMatchesOptions = {}
): Promise<Match[]> {
  const { limit = 5, season } = options;
  const db = getAdminDb();
  const now = Timestamp.now();

  let query = db
    .collection(COLLECTIONS.MATCHES)
    .where("status", "==", "scheduled")
    .where("scheduledAt", ">=", now)
    .orderBy("scheduledAt", "asc")
    .limit(limit);

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Match[];
}

export async function getRecentMatches(
  options: GetMatchesOptions = {}
): Promise<Match[]> {
  const { limit = 5 } = options;
  const db = getAdminDb();

  const snapshot = await db
    .collection(COLLECTIONS.MATCHES)
    .where("status", "==", "finished")
    .orderBy("scheduledAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Match[];
}

export async function getAllMatchesAdmin(
  options: GetMatchesOptions = {}
): Promise<Match[]> {
  const { limit = 50, season } = options;
  const db = getAdminDb();

  let query = db
    .collection(COLLECTIONS.MATCHES)
    .orderBy("scheduledAt", "desc")
    .limit(limit);

  if (season) {
    query = db
      .collection(COLLECTIONS.MATCHES)
      .where("season", "==", season)
      .orderBy("scheduledAt", "desc")
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Match[];
}

export async function getMatchById(id: string): Promise<Match | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.MATCHES).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Match;
}

export async function createMatch(
  data: Omit<Match, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection(COLLECTIONS.MATCHES).add({
    ...data,
    score: null,
    events: [],
    lineups: null,
    stats: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMatch(
  id: string,
  data: Partial<Match>
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.MATCHES).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateMatchScore(
  id: string,
  score: MatchScore
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.MATCHES).doc(id).update({
    score,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteMatch(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.MATCHES).doc(id).delete();
}
