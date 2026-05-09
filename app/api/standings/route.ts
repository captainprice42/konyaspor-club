import { NextRequest } from "next/server";
import { apiSuccess, apiCreated, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { getStandings, upsertStandingEntry } from "@/services/standingsService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

const standingSchema = z.object({
  teamId: z.string().min(1).max(100),
  teamName: z.string().min(1).max(100),
  teamLogo: z.string().nullable().optional(),
  season: z.string().regex(/^\d{4}-\d{4}$/),
  position: z.number().int().min(1).max(50),
  played: z.number().int().min(0),
  won: z.number().int().min(0),
  drawn: z.number().int().min(0),
  lost: z.number().int().min(0),
  goalsFor: z.number().int().min(0),
  goalsAgainst: z.number().int().min(0),
  goalDifference: z.number().int(),
  points: z.number().int().min(0),
  form: z.array(z.enum(["W", "D", "L"])).max(10).default([]),
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") || "2024-2025";
  const standings = await getStandings({ season });
  return apiSuccess(standings);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await requirePermission(req, "matches:write");
  const body = await req.json();
  const validated = standingSchema.parse(body);

  await upsertStandingEntry({
    ...validated,
    teamLogo: validated.teamLogo || null,
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "standings",
    resourceId: validated.teamId,
    details: `Puan durumu güncellendi: ${validated.teamName}`,
    ipAddress: getClientIp(req),
  });

  return apiCreated({ teamId: validated.teamId });
});
