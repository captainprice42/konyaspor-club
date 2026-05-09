import { NextRequest } from "next/server";
import { apiSuccess, apiCreated, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { sponsorCreateSchema } from "@/lib/security/validation";
import { getAllSponsorsAdmin, createSponsor } from "@/services/sponsorService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requirePermission(req, "sponsors:read");
  const sponsors = await getAllSponsorsAdmin();
  return apiSuccess(sponsors);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await requirePermission(req, "sponsors:write");
  const body = await req.json();
  const validated = sponsorCreateSchema.parse(body);

  const id = await createSponsor({
    ...validated,
    logo: "",
    website: validated.website || null,
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "create",
    resource: "sponsors",
    resourceId: id,
    details: `Sponsor eklendi: ${validated.name}`,
    ipAddress: getClientIp(req),
  });

  return apiCreated({ id });
});
