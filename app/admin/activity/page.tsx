"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, User, Filter } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { formatDateTime, cn } from "@/lib/utils";
import type { ActivityLog, ActivityAction } from "@/types";

const ACTION_CONFIG: Record<ActivityAction, { label: string; color: string }> = {
  create: { label: "Oluşturuldu", color: "bg-green-900/30 text-green-400" },
  update: { label: "Güncellendi", color: "bg-blue-900/30 text-blue-400" },
  delete: { label: "Silindi", color: "bg-red-900/30 text-red-400" },
  publish: { label: "Yayınlandı", color: "bg-purple-900/30 text-purple-400" },
  unpublish: { label: "Yayından Kaldırıldı", color: "bg-yellow-900/30 text-yellow-400" },
  login: { label: "Giriş", color: "bg-gray-800 text-gray-400" },
  logout: { label: "Çıkış", color: "bg-gray-800 text-gray-400" },
  upload: { label: "Yüklendi", color: "bg-cyan-900/30 text-cyan-400" },
  role_change: { label: "Rol Değişikliği", color: "bg-orange-900/30 text-orange-400" },
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<ActivityAction | "all">("all");
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<ActivityLog[]>("/api/activity-logs?limit=100");
      setLogs(data);
    } catch {
      toast({ title: "Hata", description: "Loglar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const filtered = logs.filter((log) =>
    actionFilter === "all" || log.action === actionFilter
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-400" />
            Aktivite Logları
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{logs.length} kayıt</p>
        </div>
        <button
          onClick={loadLogs}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Yenile
        </button>
      </div>

      {/* Action filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActionFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            actionFilter === "all" ? "bg-primary-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
          )}
        >
          Tümü
        </button>
        {(Object.keys(ACTION_CONFIG) as ActivityAction[]).map((action) => (
          <button
            key={action}
            onClick={() => setActionFilter(action)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              actionFilter === action ? "bg-primary-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            {ACTION_CONFIG[action].label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Aktivite kaydı bulunamadı.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((log, i) => {
              const actionConfig = ACTION_CONFIG[log.action] || { label: log.action, color: "bg-gray-800 text-gray-400" };
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{log.userEmail}</span>
                      {log.ipAddress && (
                        <>
                          <span className="text-gray-700">·</span>
                          <span className="text-xs text-gray-600">{log.ipAddress}</span>
                        </>
                      )}
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">{log.resource}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", actionConfig.color)}>
                      {actionConfig.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
