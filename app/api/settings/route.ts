import { NextRequest } from "next/server";
import { apiSuccess, apiCreated, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { siteSettingsSchema } from "@/lib/security/validation";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.SETTINGS).doc("site").get();
  if (!doc.exists) return apiSuccess(null);
  return apiSuccess({ id: doc.id, ...doc.data() });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await requireRole(req, "admin");
  const body = await req.json();
  const validated = siteSettingsSchema.parse(body);

  const db = getAdminDb();
  await db.collection(COLLECTIONS.SETTINGS).doc("site").set({
    ...validated,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "settings",
    resourceId: "site",
    details: "Site ayarları güncellendi",
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ updated: true });
});
