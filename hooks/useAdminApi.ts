"use client";

/**
 * Admin API client hook.
 * Automatically attaches Firebase ID token to all requests.
 */

import { useCallback } from "react";
import { useAuth } from "./useAuth";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

interface UseAdminApiReturn {
  request: <T>(path: string, options?: ApiOptions) => Promise<T>;
}

export function useAdminApi(): UseAdminApiReturn {
  const { getIdToken } = useAuth();

  const request = useCallback(
    async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
      const token = await getIdToken();
      if (!token) {
        throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
      }

      const { method = "GET", body } = options;

      const response = await fetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data.data as T;
    },
    [getIdToken]
  );

  return { request };
}
