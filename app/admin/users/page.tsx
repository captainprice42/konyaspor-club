"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserX, Shield, Search, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { formatDate, cn } from "@/lib/utils";
import type { AppUser, UserRole } from "@/types";

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: "Süper Admin", color: "text-red-400 bg-red-900/30" },
  admin: { label: "Admin", color: "text-orange-400 bg-orange-900/30" },
  editor: { label: "Editör", color: "text-blue-400 bg-blue-900/30" },
  viewer: { label: "İzleyici", color: "text-gray-400 bg-gray-800" },
};

type SafeUser = Pick<AppUser, "uid" | "email" | "displayName" | "role" | "isActive" | "createdAt" | "lastLoginAt">;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { request } = useAdminApi();
  const { appUser } = useAuthContext();
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<SafeUser[]>("/api/users");
      setUsers(data);
    } catch (err: unknown) {
      toast({ title: "Hata", description: "Kullanıcılar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (uid: string, role: UserRole) => {
    if (uid === appUser?.uid) {
      toast({ title: "Hata", description: "Kendi rolünüzü değiştiremezsiniz", variant: "destructive" });
      return;
    }
    setUpdatingId(uid);
    try {
      await request(`/api/users/${uid}/role`, { method: "PATCH", body: { userId: uid, role } });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role } : u));
      toast({ title: "Rol güncellendi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Güncellenemedi", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (uid: string, isActive: boolean) => {
    if (uid === appUser?.uid) {
      toast({ title: "Hata", description: "Kendi hesabınızı devre dışı bırakamazsınız", variant: "destructive" });
      return;
    }
    setUpdatingId(uid);
    try {
      await request(`/api/users/${uid}/status`, { method: "PATCH", body: { userId: uid, isActive: !isActive } });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !isActive } : u));
      toast({ title: !isActive ? "Hesap aktifleştirildi" : "Hesap devre dışı bırakıldı" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Güncellenemedi", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const isSuperAdmin = appUser?.role === "super_admin";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">{users.length} kullanıcı</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="search"
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Son Giriş</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Durum</th>
                  {isSuperAdmin && (
                    <th className="text-right px-4 py-3 text-gray-400 font-medium">İşlemler</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const isSelf = user.uid === appUser?.uid;
                  return (
                    <motion.tr
                      key={user.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "border-b border-gray-800/50 last:border-0 transition-colors",
                        isSelf ? "bg-primary-900/10" : "hover:bg-gray-800/30"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm flex items-center gap-1.5">
                              {user.displayName || user.email?.split("@")[0]}
                              {isSelf && <span className="text-xs text-primary-400">(Siz)</span>}
                            </div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isSuperAdmin && !isSelf ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                            disabled={updatingId === user.uid}
                            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-primary-500 disabled:opacity-50"
                          >
                            {Object.entries(ROLE_CONFIG).map(([value, config]) => (
                              <option key={value} value={value}>{config.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleConfig.color)}>
                            {roleConfig.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Hiç giriş yapılmadı"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          user.isActive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                        )}>
                          {user.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleActive(user.uid, user.isActive)}
                                disabled={updatingId === user.uid}
                                className={cn(
                                  "p-1.5 rounded-md transition-colors disabled:opacity-50",
                                  user.isActive
                                    ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                                    : "text-gray-500 hover:text-green-400 hover:bg-green-900/20"
                                )}
                                title={user.isActive ? "Devre dışı bırak" : "Aktifleştir"}
                              >
                                {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
