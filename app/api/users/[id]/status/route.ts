import { NextRequest } from "next/server";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { userStatusUpdateSchema } from "@/lib/security/validation";
import { setUserActive, getUserById } from "@/services/userService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requireRole(req, "super_admin");
  const { id } = await (ctx as RouteContext).params;

  if (id === session.uid) {
    return apiError("Kendi hesabınızı devre dışı bırakamazsınız", 400);
  }

  const body = await req.json();
  const { isActive } = userStatusUpdateSchema.parse(body);

  const user = await getUserById(id);
  if (!user) return apiError("Kullanıcı bulunamadı", 404);

  await setUserActive(id, isActive);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: isActive ? "update" : "update",
    resource: "users",
    resourceId: id,
    details: `Kullanıcı ${isActive ? "aktifleştirildi" : "devre dışı bırakıldı"}: ${user.email}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id, isActive });
});
