import { NextRequest } from "next/server";
import { apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { deleteMediaRecord } from "@/services/mediaService";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "media:delete");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.MEDIA).doc(id).get();
  if (!doc.exists) return apiError("Medya bulunamadı", 404);

  await deleteMediaRecord(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "media",
    resourceId: id,
    details: `Medya silindi: ${(doc.data() as { title: string }).title}`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
