"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Handshake, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { SPONSOR_TIER_LABELS, cn } from "@/lib/utils";
import type { Sponsor, SponsorTier } from "@/types";

const TIER_COLORS: Record<SponsorTier, string> = {
  main: "bg-yellow-900/30 text-yellow-400",
  official: "bg-blue-900/30 text-blue-400",
  technical: "bg-green-900/30 text-green-400",
  media: "bg-purple-900/30 text-purple-400",
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", tier: "official" as SponsorTier, order: 0 });
  const [saving, setSaving] = useState(false);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<Sponsor[]>("/api/sponsors");
      setSponsors(data);
    } catch {
      toast({ title: "Hata", description: "Sponsorlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadSponsors(); }, [loadSponsors]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" sponsorunu silmek istediğinizden emin misiniz?`)) return;
    setDeletingId(id);
    try {
      await request(`/api/sponsors/${id}`, { method: "DELETE" });
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Silindi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Silinemedi", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await request("/api/sponsors", {
        method: "POST",
        body: { ...form, isActive: true },
      });
      toast({ title: "Sponsor eklendi" });
      setShowForm(false);
      setForm({ name: "", website: "", tier: "official", order: 0 });
      await loadSponsors();
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Eklenemedi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Handshake className="w-6 h-6 text-primary-400" />
            Sponsor Yönetimi
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{sponsors.length} sponsor</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Sponsor Ekle
        </Button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Yeni Sponsor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Sponsor Adı *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Web Sitesi</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Tier</label>
              <select
                value={form.tier}
                onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value as SponsorTier }))}
                className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              >
                {Object.entries(SPONSOR_TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Sıra</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                min={0}
                className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleCreate} loading={saving}>Kaydet</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </motion.div>
      )}

      {/* Sponsors grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Henüz sponsor eklenmedi.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {sponsor.logo ? (
                    <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain p-1" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white text-sm">{sponsor.name}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block", TIER_COLORS[sponsor.tier])}>
                      {SPONSOR_TIER_LABELS[sponsor.tier]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md text-gray-500 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(sponsor.id, sponsor.name)}
                    disabled={deletingId === sponsor.id}
                    className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Sıra: {sponsor.order}</span>
                <span className={cn("px-2 py-0.5 rounded-full", sponsor.isActive ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500")}>
                  {sponsor.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
