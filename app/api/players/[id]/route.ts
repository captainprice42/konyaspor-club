import { NextRequest } from "next/server";
import { apiSuccess, apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { playerUpdateSchema } from "@/lib/security/validation";
import { getActivePlayers, updatePlayer, deletePlayer } from "@/services/playerService";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";
import type { Player } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  await requirePermission(req, "players:read");
  const { id } = await (ctx as RouteContext).params;
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.PLAYERS).doc(id).get();
  if (!doc.exists) return apiError("Oyuncu bulunamadı", 404);
  return apiSuccess({ id: doc.id, ...doc.data() });
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "players:write");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.PLAYERS).doc(id).get();
  if (!doc.exists) return apiError("Oyuncu bulunamadı", 404);

  const body = await req.json();
  const validated = playerUpdateSchema.parse(body);
  await updatePlayer(id, validated as Partial<Player>);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "players",
    resourceId: id,
    details: `Oyuncu güncellendi: ${(doc.data() as Player).name}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id });
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "players:delete");
  const { id } = await (ctx as RouteContext).params;

  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.PLAYERS).doc(id).get();
  if (!doc.exists) return apiError("Oyuncu bulunamadı", 404);

  await deletePlayer(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "players",
    resourceId: id,
    details: `Oyuncu silindi: ${(doc.data() as Player).name}`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
