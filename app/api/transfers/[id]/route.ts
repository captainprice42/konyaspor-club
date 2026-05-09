import { NextRequest } from "next/server";
import { apiSuccess, apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { transferUpdateSchema } from "@/lib/security/validation";
import { updateTransfer, deleteTransfer } from "@/services/transferService";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";
import type { Transfer } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "transfers:write");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.TRANSFERS).doc(id).get();
  if (!doc.exists) return apiError("Transfer bulunamadı", 404);

  const body = await req.json();
  const validated = transferUpdateSchema.parse(body);
  await updateTransfer(id, validated as Partial<Transfer>);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "transfers",
    resourceId: id,
    details: `Transfer güncellendi: ${(doc.data() as Transfer).playerName}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id });
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "transfers:delete");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.TRANSFERS).doc(id).get();
  if (!doc.exists) return apiError("Transfer bulunamadı", 404);

  await deleteTransfer(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "transfers",
    resourceId: id,
    details: `Transfer silindi: ${(doc.data() as Transfer).playerName}`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
