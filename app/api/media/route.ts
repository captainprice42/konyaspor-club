import { NextRequest } from "next/server";
import { apiSuccess, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { getMediaItems } from "@/services/mediaService";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requirePermission(req, "media:read");
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "image" | "video" | null;
  const items = await getMediaItems({ type: type || undefined });
  return apiSuccess(items);
});
