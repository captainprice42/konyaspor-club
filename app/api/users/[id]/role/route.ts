import { NextRequest } from "next/server";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { userRoleUpdateSchema } from "@/lib/security/validation";
import { updateUserRole, getUserById } from "@/services/userService";
import { logActivity } from "@/lib/services/activityLog";
import { getClientIp } from "@/lib/security/rateLimit";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/users/[id]/role — Update user role (super_admin only)
export const PATCH = withErrorHandler(async (req: NextRequest, ctx: unknown) => {
  const session = await requireRole(req, "super_admin");
  const { id } = await (ctx as RouteContext).params;

  // Prevent self-demotion
  if (id === session.uid) {
    return apiError("Kendi rolünüzü değiştiremezsiniz", 400);
  }

  const body = await req.json();
  const { role } = userRoleUpdateSchema.parse(body);

  const user = await getUserById(id);
  if (!user) return apiError("Kullanıcı bulunamadı", 404);

  await updateUserRole(id, role);

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "role_change",
    resource: "users",
    resourceId: id,
    details: `Kullanıcı rolü değiştirildi: ${user.email} → ${role}`,
    ipAddress: getClientIp(req),
  });

  return apiSuccess({ id, role });
});
