import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import type { AppUser, UserRole, ROLE_PERMISSIONS } from "@/types";
import { ROLE_PERMISSIONS as PERMISSIONS } from "@/types";

export async function getUserById(uid: string): Promise<AppUser | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() } as AppUser;
}

export async function getAllUsers(): Promise<AppUser[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.USERS)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as AppUser[];
}

export async function createUserRecord(
  uid: string,
  email: string,
  displayName: string | null,
  role: UserRole = "viewer"
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.USERS).doc(uid).set({
    uid,
    email,
    displayName,
    photoURL: null,
    role,
    isActive: true,
    permissions: PERMISSIONS[role],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastLoginAt: null,
  });
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.USERS).doc(uid).update({
    role,
    permissions: PERMISSIONS[role],
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Also set custom claims in Firebase Auth for token-level role checks
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { role });
}

export async function setUserActive(
  uid: string,
  isActive: boolean
): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  await Promise.all([
    db.collection(COLLECTIONS.USERS).doc(uid).update({
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    // Disable/enable in Firebase Auth as well
    auth.updateUser(uid, { disabled: !isActive }),
  ]);
}

export async function updateLastLogin(uid: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.USERS).doc(uid).update({
    lastLoginAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteUser(uid: string): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  await Promise.all([
    db.collection(COLLECTIONS.USERS).doc(uid).delete(),
    auth.deleteUser(uid),
  ]);
}
