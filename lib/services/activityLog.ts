/**
 * Activity Log Service — Server-side only
 * Records all admin actions for audit trail.
 */

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import type { ActivityAction, ActivityLog } from "@/types";

interface LogActivityParams {
  userId: string;
  userEmail: string;
  action: ActivityAction;
  resource: string;
  resourceId?: string | null;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection(COLLECTIONS.ACTIVITY_LOGS).add({
      ...params,
      resourceId: params.resourceId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    // Log failures should never break the main operation
    console.error("[ActivityLog] Failed to log activity:", error);
  }
}

export async function getActivityLogs(
  limit = 50,
  startAfterDoc?: string
): Promise<ActivityLog[]> {
  const db = getAdminDb();
  let query = db
    .collection(COLLECTIONS.ACTIVITY_LOGS)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfterDoc) {
    const cursor = await db
      .collection(COLLECTIONS.ACTIVITY_LOGS)
      .doc(startAfterDoc)
      .get();
    if (cursor.exists) {
      query = query.startAfter(cursor);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLog[];
}
