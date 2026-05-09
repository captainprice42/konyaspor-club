/**
 * Server-side session verification
 * Validates Firebase ID tokens on every protected API request.
 */

import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AppUser, UserRole, Permission, ROLE_PERMISSIONS } from "@/types";
import { ROLE_PERMISSIONS as PERMISSIONS } from "@/types";

export interface SessionUser {
  uid: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
}

/**
 * Verify Firebase ID token from Authorization header.
 * Returns null if token is invalid or user is inactive.
 */
export async function verifySession(
  request: Request
): Promise<SessionUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token || token.length < 10) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token, true); // checkRevoked = true

    // Fetch user record from Firestore for role/status
    const db = getAdminDb();
    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) return null;

    const userData = userDoc.data() as AppUser;
    if (!userData.isActive) return null;

    return {
      uid: decoded.uid,
      email: decoded.email || "",
      role: userData.role,
      permissions: PERMISSIONS[userData.role] || [],
      isActive: userData.isActive,
    };
  } catch (error) {
    // Token expired, revoked, or malformed — all treated as unauthenticated
    return null;
  }
}

/**
 * Check if session user has a specific permission.
 */
export function hasPermission(
  user: SessionUser,
  permission: Permission
): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if session user has a specific role or higher.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export function hasRole(user: SessionUser, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Require authentication — throws if not authenticated.
 * Use in API route handlers.
 */
export async function requireAuth(request: Request): Promise<SessionUser> {
  const session = await verifySession(request);
  if (!session) {
    throw new AuthError("Kimlik doğrulama gerekli", 401);
  }
  return session;
}

/**
 * Require specific permission — throws if not authorized.
 */
export async function requirePermission(
  request: Request,
  permission: Permission
): Promise<SessionUser> {
  const session = await requireAuth(request);
  if (!hasPermission(session, permission)) {
    throw new AuthError("Bu işlem için yetkiniz yok", 403);
  }
  return session;
}

/**
 * Require minimum role level.
 */
export async function requireRole(
  request: Request,
  minRole: UserRole
): Promise<SessionUser> {
  const session = await requireAuth(request);
  if (!hasRole(session, minRole)) {
    throw new AuthError("Bu işlem için yetkiniz yok", 403);
  }
  return session;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
