"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { formatDate, CATEGORY_LABELS, cn } from "@/lib/utils";
import type { NewsArticle, NewsStatus } from "@/types";

const STATUS_CONFIG: Record<NewsStatus, { label: string; variant: "default" | "success" | "warning" | "info" | "outline" }> = {
  published: { label: "Yayında", variant: "success" },
  draft: { label: "Taslak", variant: "outline" },
  scheduled: { label: "Planlandı", variant: "info" },
  archived: { label: "Arşiv", variant: "warning" },
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NewsStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const data = await request<{ items: NewsArticle[]; total: number }>(`/api/news${params}`);
      setArticles(data.items);
    } catch (err: unknown) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Haberler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [request, statusFilter, toast]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" haberini silmek istediğinizden emin misiniz?`)) return;
    setDeletingId(id);
    try {
      await request(`/api/news/${id}`, { method: "DELETE" });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Silindi", description: "Haber başarıyla silindi.", variant: "success" as "default" });
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

  const handleTogglePublish = async (article: NewsArticle) => {
    const newStatus: NewsStatus =
      article.status === "published" ? "draft" : "published";
    try {
      await request(`/api/news/${article.id}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a))
      );
      toast({
        title: newStatus === "published" ? "Yayınlandı" : "Taslağa alındı",
        description: article.title,
      });
    } catch (err: unknown) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Güncellenemedi",
        variant: "destructive",
      });
    }
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.authorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Haber Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {articles.length} haber
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="w-4 h-4" />
            Yeni Haber
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Haber ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft", "scheduled", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-primary-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              {s === "all" ? "Tümü" : STATUS_CONFIG[s as NewsStatus]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {search ? "Arama sonucu bulunamadı." : "Henüz haber eklenmedi."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Başlık</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Yazar</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Durum</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Tarih</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article, i) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {article.featured && (
                          <Star className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-medium line-clamp-1 max-w-[250px]">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="default" className="text-xs">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {article.authorName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_CONFIG[article.status]?.variant || "outline"} className="text-xs">
                        {STATUS_CONFIG[article.status]?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTogglePublish(article)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                          title={article.status === "published" ? "Taslağa al" : "Yayınla"}
                        >
                          {article.status === "published" ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/admin/news/${article.id}/edit`}
                          className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Sil"
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
