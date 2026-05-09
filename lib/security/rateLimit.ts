/**
 * Rate Limiting — Firestore-backed sliding window
 *
 * Uses Firestore to track request counts per IP.
 * Falls back gracefully if Firestore is unavailable.
 *
 * For production at scale, replace with Redis (Upstash).
 */

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Sanitize identifier to prevent Firestore path injection
  const safeId = identifier.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const docId = `${safeId}_${Math.floor(now / windowMs)}`;

  try {
    const db = getAdminDb();
    const ref = db.collection(COLLECTIONS.RATE_LIMITS).doc(docId);

    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);

      if (!doc.exists) {
        tx.set(ref, {
          identifier: safeId,
          count: 1,
          windowStart: now,
          expiresAt: new Date(now + windowMs * 2),
        });
        return { count: 1, windowStart: now };
      }

      const data = doc.data()!;
      const count = (data.count as number) + 1;

      tx.update(ref, {
        count: FieldValue.increment(1),
        lastRequest: now,
      });

      return { count, windowStart: data.windowStart as number };
    });

    const remaining = Math.max(0, maxRequests - result.count);
    const resetAt = result.windowStart + windowMs;

    return {
      allowed: result.count <= maxRequests,
      remaining,
      resetAt,
    };
  } catch (error) {
    // Fail open — don't block requests if rate limit check fails
    console.error("[RateLimit] Check failed, allowing request:", error);
    return { allowed: true, remaining: maxRequests, resetAt: now + windowMs };
  }
}

// Preset configs for different endpoints
export const RATE_LIMIT_CONFIGS = {
  api: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 min
  },
  auth: {
    maxRequests: 10,
    windowMs: 900000, // 15 min — stricter for auth
  },
  upload: {
    maxRequests: 20,
    windowMs: 3600000, // 1 hour
  },
  public: {
    maxRequests: 200,
    windowMs: 900000,
  },
} as const;

// Extract real IP from request headers
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take first IP from comma-separated list
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
