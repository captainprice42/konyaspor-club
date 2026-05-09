import { NextRequest } from "next/server";
import { apiSuccess, apiCreated, apiRateLimited, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/security/rateLimit";
import { matchCreateSchema } from "@/lib/security/validation";
import { getAllMatchesAdmin, createMatch } from "@/services/matchService";
import { logActivity } from "@/lib/services/activityLog";
import { Timestamp } from "firebase-admin/firestore";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requirePermission(req, "matches:read");
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") || undefined;
  const matches = await getAllMatchesAdmin({ season });
  return apiSuccess(matches);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ip = getClientIp(req);
  const rl = await checkRateLimit({ ...RATE_LIMIT_CONFIGS.api, identifier: `match_create_${ip}` });
  if (!rl.allowed) return apiRateLimited(rl.resetAt);

  const session = await requirePermission(req, "matches:write");
  const body = await req.json();
  const validated = matchCreateSchema.parse(body);

  const id = await createMatch({
    homeTeam: {
      id: `team_${Date.now()}_home`,
      name: validated.homeTeamName,
      shortName: validated.homeTeamShortName,
      logo: validated.homeTeamLogo || null,
      isHome: true,
    },
    awayTeam: {
      id: `team_${Date.now()}_away`,
      name: validated.awayTeamName,
      shortName: validated.awayTeamShortName,
      logo: validated.awayTeamLogo || null,
      isHome: false,
    },
    competition: validated.competition,
    season: validated.season,
    matchday: validated.matchday,
    venue: validated.venue,
    scheduledAt: Timestamp.fromDate(new Date(validated.scheduledAt)),
    status: validated.status,
    score: null,
    events: [],
    lineups: null,
    stats: null,
    ticketUrl: validated.ticketUrl || null,
    broadcastInfo: validated.broadcastInfo || null,
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "create",
    resource: "matches",
    resourceId: id,
    details: `Maç eklendi: ${validated.homeTeamName} vs ${validated.awayTeamName}`,
    ipAddress: ip,
  });

  return apiCreated({ id });
});
