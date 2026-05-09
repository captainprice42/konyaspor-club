"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/types";

interface AdminGuardProps {
  children: React.ReactNode;
  minRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export function AdminGuard({ children, minRole = "editor" }: AdminGuardProps) {
  const { user, appUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !appUser) {
      router.replace("/admin/login");
      return;
    }

    if (!appUser.isActive) {
      router.replace("/admin/login?error=disabled");
      return;
    }

    const userLevel = ROLE_HIERARCHY[appUser.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      router.replace("/admin?error=unauthorized");
    }
  }, [user, appUser, loading, router, minRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !appUser || !appUser.isActive) {
    return null;
  }

  const userLevel = ROLE_HIERARCHY[appUser.role] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

  if (userLevel < requiredLevel) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold">Yetersiz yetki</p>
          <p className="text-gray-500 text-sm mt-1">Bu sayfaya erişim izniniz yok.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
