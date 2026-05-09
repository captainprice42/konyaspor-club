"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { formatDate, COMPETITION_LABELS, cn } from "@/lib/utils";
import type { Match, MatchStatus } from "@/types";

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string }> = {
  scheduled: { label: "Planlandı", color: "bg-blue-900/30 text-blue-400" },
  live: { label: "CANLI", color: "bg-red-900/30 text-red-400 animate-pulse" },
  finished: { label: "Tamamlandı", color: "bg-green-900/30 text-green-400" },
  postponed: { label: "Ertelendi", color: "bg-yellow-900/30 text-yellow-400" },
  cancelled: { label: "İptal", color: "bg-gray-800 text-gray-500" },
};

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<Match[]>("/api/matches");
      setMatches(data);
    } catch {
      toast({ title: "Hata", description: "Maçlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu maçı silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      await request(`/api/matches/${id}`, { method: "DELETE" });
      setMatches((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Silindi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Silinemedi", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = matches.filter((m) =>
    m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
    m.awayTeam.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Maç Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">{matches.length} maç</p>
        </div>
        <Button asChild>
          <Link href="/admin/matches/new">
            <Plus className="w-4 h-4" />
            Maç Ekle
          </Link>
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="search"
          placeholder="Takım ara..."
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Henüz maç eklenmedi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Maç</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Tarih</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Müsabaka</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Skor</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Durum</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((match, i) => (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                        <span className="text-white font-medium text-sm">
                          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 ml-5">{match.venue}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {formatDate(match.scheduledAt, "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">
                        {COMPETITION_LABELS[match.competition]} · {match.season}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {match.score ? (
                        <span className="font-bold text-white tabular-nums">
                          {match.score.home} - {match.score.away}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_CONFIG[match.status].color)}>
                        {STATUS_CONFIG[match.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/matches/${match.id}/edit`}
                          className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(match.id)}
                          disabled={deletingId === match.id}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
