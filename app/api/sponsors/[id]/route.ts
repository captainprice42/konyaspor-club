import { NextRequest } from "next/server";
import { apiSuccess, apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { sponsorUpdateSchema } from "@/lib/security/validation";
import { updateSponsor, deleteSponsor } from "@/services/sponsorService";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";
import type { Sponsor } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "sponsors:write");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.SPONSORS).doc(id).get();
  if (!doc.exists) return apiError("Sponsor bulunamadı", 404);

  const body = await req.json();
  const validated = sponsorUpdateSchema.parse(body);
  await updateSponsor(id, validated as Partial<Sponsor>);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "sponsors",
    resourceId: id,
    details: `Sponsor güncellendi: ${(doc.data() as Sponsor).name}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id });
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "sponsors:delete");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.SPONSORS).doc(id).get();
  if (!doc.exists) return apiError("Sponsor bulunamadı", 404);

  await deleteSponsor(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "sponsors",
    resourceId: id,
    details: `Sponsor silindi: ${(doc.data() as Sponsor).name}`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
