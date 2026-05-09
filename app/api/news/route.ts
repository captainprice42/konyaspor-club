import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiCreated,
  apiError,
  apiRateLimited,
  withErrorHandler,
} from "@/lib/api/response";
import {
  requirePermission,
} from "@/lib/auth/session";
import {
  checkRateLimit,
  RATE_LIMIT_CONFIGS,
  getClientIp,
} from "@/lib/security/rateLimit";
import { newsCreateSchema } from "@/lib/security/validation";
import {
  getAllNewsAdmin,
  createNews,
  getNewsCount,
} from "@/services/newsService";
import { logActivity } from "@/lib/services/activityLog";

// GET /api/news — List all news (admin)
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await requirePermission(req, "news:read");

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "draft" | "published" | "scheduled" | "archived" | undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const startAfter = searchParams.get("startAfter") || undefined;

  const [news, total] = await Promise.all([
    getAllNewsAdmin({ limit, status: status || undefined, startAfter }),
    getNewsCount(status || undefined),
  ]);

  return apiSuccess({ items: news, total });
});

// POST /api/news — Create news article
export const POST = withErrorHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIp(req);
  const rl = await checkRateLimit({
    ...RATE_LIMIT_CONFIGS.api,
    identifier: `news_create_${ip}`,
  });
  if (!rl.allowed) return apiRateLimited(rl.resetAt);

  const session = await requirePermission(req, "news:write");

  const body = await req.json();
  const validated = newsCreateSchema.parse(body);

  const id = await createNews(
    {
      ...validated,
      slug: validated.slug || "",
      coverImage: null,
      coverImageAlt: validated.coverImageAlt || "",
      scheduledAt: validated.scheduledAt
        ? new (await import("firebase-admin/firestore")).Timestamp(
            Math.floor(new Date(validated.scheduledAt).getTime() / 1000),
            0
          )
        : null,
      publishedAt: null,
      featured: validated.featured,
      authorId: session.uid,
      authorName: session.email,
      seo: {
        title: validated.seo?.title || "",
        description: validated.seo?.description || "",
        keywords: validated.seo?.keywords || [],
        ogImage: validated.seo?.ogImage || null,
        canonicalUrl: validated.seo?.canonicalUrl || null,
        noIndex: validated.seo?.noIndex || false,
      },
      tags: validated.tags || [],
    },
    session.uid,
    session.email
  );

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "create",
    resource: "news",
    resourceId: id,
    details: `Haber oluşturuldu: ${validated.title}`,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent"),
  });

  return apiCreated({ id });
});
