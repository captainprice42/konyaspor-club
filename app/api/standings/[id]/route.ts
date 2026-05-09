import { NextRequest } from "next/server";
import { apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { deleteStandingEntry } from "@/services/standingsService";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "matches:delete");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.STANDINGS).doc(id).get();
  if (!doc.exists) return apiError("Kayıt bulunamadı", 404);

  await deleteStandingEntry(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "standings",
    resourceId: id,
    details: `Puan durumu kaydı silindi`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
