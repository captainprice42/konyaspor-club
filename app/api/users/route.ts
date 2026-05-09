import { NextRequest } from "next/server";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { getAllUsers } from "@/services/userService";

// GET /api/users — List all users (admin only)
export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireRole(req, "admin");
  const users = await getAllUsers();
  // Never return sensitive fields
  const safeUsers = users.map(({ uid, email, displayName, role, isActive, createdAt, lastLoginAt }) => ({
    uid,
    email,
    displayName,
    role,
    isActive,
    createdAt,
    lastLoginAt,
  }));
  return apiSuccess(safeUsers);
});
