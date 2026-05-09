"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Users,
  Calendar,
  ArrowRightLeft,
  Activity,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useAdminApi } from "@/hooks/useAdminApi";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityLog } from "@/types";

interface DashboardStats {
  news: { total: number; published: number };
  players: number;
  matches: { total: number; upcoming: number };
  transfers: number;
  users: number;
}

export default function AdminDashboardPage() {
  const { appUser } = useAuthContext();
  const { request } = useAdminApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.allSettled([
          request<DashboardStats>("/api/dashboard/stats"),
          request<ActivityLog[]>("/api/activity-logs?limit=10"),
        ]);

        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (logsData.status === "fulfilled") setRecentLogs(logsData.value);
      } catch {
        // Handled per-request
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [request]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">
          {greeting()},{" "}
          <span className="text-primary-400">
            {appUser?.displayName || appUser?.email?.split("@")[0] || "Admin"}
          </span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} yönetim paneline hoş geldiniz.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Toplam Haber"
            value={stats?.news.total ?? 0}
            subtitle={`${stats?.news.published ?? 0} yayında`}
            icon={<Newspaper className="w-4 h-4" />}
            color="blue"
            loading={loading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            title="Aktif Oyuncu"
            value={stats?.players ?? 0}
            subtitle="Kadrodaki futbolcular"
            icon={<Users className="w-4 h-4" />}
            color="green"
            loading={loading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Yaklaşan Maç"
            value={stats?.matches.upcoming ?? 0}
            subtitle={`${stats?.matches.total ?? 0} toplam maç`}
            icon={<Calendar className="w-4 h-4" />}
            color="yellow"
            loading={loading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            title="Transfer"
            value={stats?.transfers ?? 0}
            subtitle="Bu sezon"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            color="purple"
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Hızlı İşlemler
          </h2>
          <div className="space-y-2">
            {[
              { label: "Yeni Haber Ekle", href: "/admin/news/new", color: "text-blue-400" },
              { label: "Oyuncu Ekle", href: "/admin/players/new", color: "text-green-400" },
              { label: "Maç Ekle", href: "/admin/matches/new", color: "text-yellow-400" },
              { label: "Transfer Ekle", href: "/admin/transfers/new", color: "text-purple-400" },
              { label: "Medya Yükle", href: "/admin/media", color: "text-pink-400" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
              >
                <span className={`text-sm font-medium ${action.color}`}>
                  {action.label}
                </span>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-xs">
                  →
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-400" />
            Son Aktiviteler
          </h2>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              Henüz aktivite kaydı yok.
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-2 border-b border-gray-800/50 last:border-0"
                >
                  <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-snug">{log.details}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-600">{log.userEmail}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 flex-shrink-0">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
