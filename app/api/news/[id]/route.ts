import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiNoContent,
  apiError,
  withErrorHandler,
} from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { newsUpdateSchema } from "@/lib/security/validation";
import {
  getNewsById,
  updateNews,
  deleteNews,
} from "@/services/newsService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/news/[id]
export const GET = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  await requirePermission(req, "news:read");
  const { id } = await (ctx as RouteContext).params;

  const article = await getNewsById(id);
  if (!article) return apiError("Haber bulunamadı", 404);

  return apiSuccess(article);
});

// PATCH /api/news/[id]
export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "news:write");
  const { id } = await (ctx as RouteContext).params;

  const existing = await getNewsById(id);
  if (!existing) return apiError("Haber bulunamadı", 404);

  const body = await req.json();
  const validated = newsUpdateSchema.parse(body);

  await updateNews(id, validated as Parameters<typeof updateNews>[1]);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "update",
    resource: "news",
    resourceId: id,
    details: `Haber güncellendi: ${existing.title}`,
    ipAddress: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return apiSuccess({ id });
});

// DELETE /api/news/[id]
export const DELETE = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requirePermission(req, "news:delete");
  const { id } = await (ctx as RouteContext).params;

  const existing = await getNewsById(id);
  if (!existing) return apiError("Haber bulunamadı", 404);

  await deleteNews(id);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "delete",
    resource: "news",
    resourceId: id,
    details: `Haber silindi: ${existing.title}`,
    ipAddress: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return apiNoContent();
});
