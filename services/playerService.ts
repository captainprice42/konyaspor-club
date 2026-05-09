import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { generateSlug } from "@/lib/utils";
import { sanitizeText as sanitize } from "@/lib/security/sanitize";
import { FieldValue } from "firebase-admin/firestore";
import type { Player, PlayerPosition, PlayerStatus } from "@/types";

interface GetPlayersOptions {
  limit?: number;
  position?: PlayerPosition;
  status?: PlayerStatus;
  isActive?: boolean;
}

export async function getActivePlayers(
  options: GetPlayersOptions = {}
): Promise<Player[]> {
  const { limit = 30, position } = options;
  const db = getAdminDb();

  let query = db
    .collection(COLLECTIONS.PLAYERS)
    .where("isActive", "==", true)
    .orderBy("number", "asc")
    .limit(limit);

  if (position) {
    query = db
      .collection(COLLECTIONS.PLAYERS)
      .where("isActive", "==", true)
      .where("position", "==", position)
      .orderBy("number", "asc")
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Player[];
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.PLAYERS)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Player;
}

export async function getAllPlayersAdmin(): Promise<Player[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.PLAYERS)
    .orderBy("number", "asc")
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Player[];
}

export async function createPlayer(
  data: Omit<Player, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();

  let slug = generateSlug(data.name);
  const existing = await db
    .collection(COLLECTIONS.PLAYERS)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existing.empty) slug = `${slug}-${Date.now()}`;

  const docRef = await db.collection(COLLECTIONS.PLAYERS).add({
    ...data,
    slug,
    name: sanitize(data.name),
    bio: sanitize(data.bio),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return docRef.id;
}

export async function updatePlayer(
  id: string,
  data: Partial<Player>
): Promise<void> {
  const db = getAdminDb();
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.name) updateData.name = sanitize(data.name);
  if (data.bio) updateData.bio = sanitize(data.bio);
  await db.collection(COLLECTIONS.PLAYERS).doc(id).update(updateData);
}

export async function deletePlayer(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.PLAYERS).doc(id).delete();
}
