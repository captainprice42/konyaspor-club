import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import { sanitizeText, sanitizeUrl } from "@/lib/security/sanitize";
import type { Sponsor, SponsorTier } from "@/types";

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.SPONSORS)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sponsor[];
}

export async function getAllSponsorsAdmin(): Promise<Sponsor[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.SPONSORS)
    .orderBy("order", "asc")
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sponsor[];
}

export async function createSponsor(
  data: Omit<Sponsor, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection(COLLECTIONS.SPONSORS).add({
    ...data,
    name: sanitizeText(data.name),
    website: data.website ? sanitizeUrl(data.website) : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSponsor(
  id: string,
  data: Partial<Sponsor>
): Promise<void> {
  const db = getAdminDb();
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.name) updateData.name = sanitizeText(data.name);
  if (data.website) updateData.website = sanitizeUrl(data.website);
  await db.collection(COLLECTIONS.SPONSORS).doc(id).update(updateData);
}

export async function deleteSponsor(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.SPONSORS).doc(id).delete();
}
