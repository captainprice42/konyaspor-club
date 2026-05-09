import { NextRequest } from "next/server";
import { apiSuccess, apiCreated, apiRateLimited, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/security/rateLimit";
import { transferCreateSchema } from "@/lib/security/validation";
import { getTransfers, createTransfer } from "@/services/transferService";
import { logActivity } from "@/lib/services/activityLog";
import { Timestamp } from "firebase-admin/firestore";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requirePermission(req, "transfers:read");
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season") || undefined;
  const transfers = await getTransfers({ season });
  return apiSuccess(transfers);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const ip = getClientIp(req);
  const rl = await checkRateLimit({ ...RATE_LIMIT_CONFIGS.api, identifier: `transfer_create_${ip}` });
  if (!rl.allowed) return apiRateLimited(rl.resetAt);

  const session = await requirePermission(req, "transfers:write");
  const body = await req.json();
  const validated = transferCreateSchema.parse(body);

  const id = await createTransfer({
    ...validated,
    playerPhoto: null,
    announcedAt: Timestamp.fromDate(new Date(validated.announcedAt)),
    fee: validated.fee || null,
    contractUntil: validated.contractUntil || null,
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "create",
    resource: "transfers",
    resourceId: id,
    details: `Transfer eklendi: ${validated.playerName} (${validated.type})`,
    ipAddress: ip,
  });

  return apiCreated({ id });
});
