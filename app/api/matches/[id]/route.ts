import { NextRequest } from "next/server";
import { apiSuccess, apiNoContent, apiError, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { matchUpdateSchema, matchScoreSchema } from "@/lib/security/validation";
import { getMatchById, updateMatch, deleteMatch, updateMatchScore } from "@/services/matchService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  await requirePermission(req, "matches:read");
  const { id } = await (ctx as RouteContext).params;
  const match = await getMatchById(id);
  if (!match) return apiError("Maç bulunamadı", 404);
  return apiSuccess(match);
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "matches:write");
  const { id } = await (ctx as RouteContext).params;

  const match = await getMatchById(id);
  if (!match) return apiError("Maç bulunamadı", 404);

  const body = await req.json();

  // Handle score update separately
  if (body.score !== undefined) {
    const score = matchScoreSchema.parse(body.score);
    await updateMatchScore(id, score);
  } else {
    const validated = matchUpdateSchema.parse(body);
    await updateMatch(id, validated as Parameters<typeof updateMatch>[1]);
  }

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "matches",
    resourceId: id,
    details: `Maç güncellendi: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id });
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "matches:delete");
  const { id } = await (ctx as RouteContext).params;

  const match = await getMatchById(id);
  if (!match) return apiError("Maç bulunamadı", 404);

  await deleteMatch(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "matches",
    resourceId: id,
    details: `Maç silindi: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
    ipAddress: getClientIp(req),
  });

  return apiNoContent();
});
