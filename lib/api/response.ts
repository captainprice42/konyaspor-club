/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiError(
  message: string,
  status = 500,
  details?: unknown
): NextResponse {
  const body: Record<string, unknown> = { success: false, error: message };
  if (details && process.env.NODE_ENV === "development") {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function apiCreated<T>(data: T): NextResponse {
  return apiSuccess(data, 201);
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Wraps an API handler with standardized error handling.
 * Catches AuthError, ZodError, and generic errors.
 */
export function withErrorHandler(
  handler: (req: NextRequest, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof AuthError) {
        return apiError(error.message, error.statusCode);
      }

      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return apiError(`Doğrulama hatası: ${messages.join(", ")}`, 400);
      }

      if (error instanceof Error) {
        console.error("[API Error]", error.message, error.stack);
        return apiError(
          process.env.NODE_ENV === "development"
            ? error.message
            : "Sunucu hatası oluştu",
          500
        );
      }

      return apiError("Bilinmeyen hata", 500);
    }
  };
}

/**
 * Rate limit response
 */
export function apiRateLimited(resetAt: number): NextResponse {
  return NextResponse.json(
    { success: false, error: "Çok fazla istek. Lütfen bekleyin." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}
