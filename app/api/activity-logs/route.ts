import { NextRequest } from "next/server";
import { apiSuccess, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { getActivityLogs } from "@/lib/services/activityLog";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireRole(req, "admin");
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const startAfter = searchParams.get("startAfter") || undefined;
  const logs = await getActivityLogs(limit, startAfter);
  return apiSuccess(logs);
});
