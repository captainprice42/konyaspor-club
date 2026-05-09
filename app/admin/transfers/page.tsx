"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, ArrowRightLeft, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { formatDate, TRANSFER_TYPE_LABELS, cn } from "@/lib/utils";
import type { Transfer, TransferType } from "@/types";

const TYPE_COLORS: Record<TransferType, string> = {
  in: "bg-green-900/30 text-green-400",
  out: "bg-red-900/30 text-red-400",
  loan_in: "bg-blue-900/30 text-blue-400",
  loan_out: "bg-yellow-900/30 text-yellow-400",
  free: "bg-gray-800 text-gray-400",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-900/30 text-green-400",
  rumour: "bg-yellow-900/30 text-yellow-400",
  completed: "bg-blue-900/30 text-blue-400",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Kesinleşti",
  rumour: "Söylenti",
  completed: "Tamamlandı",
};

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransferType | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<Transfer[]>("/api/transfers");
      setTransfers(data);
    } catch {
      toast({ title: "Hata", description: "Transferler yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadTransfers(); }, [loadTransfers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu transferi silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      await request(`/api/transfers/${id}`, { method: "DELETE" });
      setTransfers((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Silindi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Silinemedi", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = transfers.filter((t) => {
    const matchesSearch = t.playerName.toLowerCase().includes(search.toLowerCase()) ||
      t.fromClub.toLowerCase().includes(search.toLowerCase()) ||
      t.toClub.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transfer Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">{transfers.length} transfer</p>
        </div>
        <Button asChild>
          <Link href="/admin/transfers/new">
            <Plus className="w-4 h-4" />
            Transfer Ekle
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Oyuncu veya kulüp ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "in", "out", "loan_in", "loan_out", "free"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                typeFilter === t ? "bg-primary-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              {t === "all" ? "Tümü" : TRANSFER_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Henüz transfer eklenmedi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Oyuncu</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Hareket</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Tür</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Bedel</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Durum</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Tarih</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transfer, i) => (
                  <motion.tr
                    key={transfer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{transfer.playerNationality}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{transfer.playerName}</div>
                          <div className="text-gray-500 text-xs">{transfer.season}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="truncate max-w-[80px]">{transfer.fromClub}</span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{transfer.toClub}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[transfer.type])}>
                        {TRANSFER_TYPE_LABELS[transfer.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm hidden lg:table-cell">
                      {transfer.fee || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[transfer.status])}>
                        {STATUS_LABELS[transfer.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {formatDate(transfer.announcedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/transfers/${transfer.id}/edit`}
                          className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(transfer.id)}
                          disabled={deletingId === transfer.id}
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
