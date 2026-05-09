"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { POSITION_LABELS, cn } from "@/lib/utils";
import type { Player, PlayerPosition } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  active: "success",
  injured: "destructive",
  suspended: "warning",
  loaned: "info",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  injured: "Sakatlık",
  suspended: "Cezalı",
  loaned: "Kiralık",
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<Player[]>("/api/players");
      setPlayers(data);
    } catch (err: unknown) {
      toast({
        title: "Hata",
        description: "Oyuncular yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" oyuncusunu silmek istediğinizden emin misiniz?`)) return;
    setDeletingId(id);
    try {
      await request(`/api/players/${id}`, { method: "DELETE" });
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Silindi", description: `${name} kadrodan çıkarıldı.` });
    } catch (err: unknown) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Silinemedi",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === "all" || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const positions: (PlayerPosition | "all")[] = ["all", "goalkeeper", "defender", "midfielder", "forward"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Oyuncu Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">{players.length} oyuncu</p>
        </div>
        <Button asChild>
          <Link href="/admin/players/new">
            <Plus className="w-4 h-4" />
            Oyuncu Ekle
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Oyuncu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                positionFilter === pos
                  ? "bg-primary-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              {pos === "all" ? "Tümü" : POSITION_LABELS[pos]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {search ? "Arama sonucu bulunamadı." : "Henüz oyuncu eklenmedi."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group"
            >
              {/* Photo */}
              <div className="relative h-40 bg-gray-800">
                {player.photo ? (
                  <Image
                    src={player.photo}
                    alt={player.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="w-7 h-7 bg-accent-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">
                    {player.number}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={STATUS_COLORS[player.status] as "default"} className="text-xs">
                    {STATUS_LABELS[player.status]}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-white text-sm truncate">{player.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {POSITION_LABELS[player.position]} · {player.nationality}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/admin/players/${player.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Düzenle
                  </Link>
                  <button
                    onClick={() => handleDelete(player.id, player.name)}
                    disabled={deletingId === player.id}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
