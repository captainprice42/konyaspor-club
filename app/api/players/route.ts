import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiCreated,
  apiError,
  apiRateLimited,
  withErrorHandler,
} from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/security/rateLimit";
import { playerCreateSchema } from "@/lib/security/validation";
import { getAllPlayersAdmin, createPlayer } from "@/services/playerService";
import { logActivity } from "@/lib/services/activityLog";
import { Timestamp } from "firebase-admin/firestore";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requirePermission(req, "players:read");
  const players = await getAllPlayersAdmin();
  return apiSuccess(players);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ip = getClientIp(req);
  const rl = await checkRateLimit({ ...RATE_LIMIT_CONFIGS.api, identifier: `player_create_${ip}` });
  if (!rl.allowed) return apiRateLimited(rl.resetAt);

  const session = await requirePermission(req, "players:write");
  const body = await req.json();
  const validated = playerCreateSchema.parse(body);

  const id = await createPlayer({
    ...validated,
    birthDate: Timestamp.fromDate(new Date(validated.birthDate)),
    photo: null,
    slug: "",
    stats: { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 },
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "create",
    resource: "players",
    resourceId: id,
    details: `Oyuncu eklendi: ${validated.name}`,
    ipAddress: ip,
  });

  return apiCreated({ id });
});
