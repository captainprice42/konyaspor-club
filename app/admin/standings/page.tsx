"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Trophy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { StandingEntry } from "@/types";

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [season, setSeason] = useState("2024-2025");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    teamId: "",
    teamName: "",
    teamLogo: "",
    position: 1,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  });
  const { request } = useAdminApi();
  const { toast } = useToast();

  const loadStandings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<StandingEntry[]>(`/api/standings?season=${season}`);
      setStandings(data);
    } catch {
      toast({ title: "Hata", description: "Puan durumu yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, season, toast]);

  useEffect(() => { loadStandings(); }, [loadStandings]);

  const handleSave = async () => {
    if (!form.teamName.trim()) return;
    setSaving(true);
    try {
      await request("/api/standings", {
        method: "POST",
        body: {
          ...form,
          teamId: form.teamId || `team_${form.teamName.toLowerCase().replace(/\s+/g, "_")}`,
          teamLogo: form.teamLogo || null,
          season,
          form: [],
        },
      });
      toast({ title: "Kaydedildi" });
      setShowForm(false);
      setForm({ teamId: "", teamName: "", teamLogo: "", position: standings.length + 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 });
      await loadStandings();
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Kaydedilemedi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinizden emin misiniz?")) return;
    try {
      await request(`/api/standings/${id}`, { method: "DELETE" });
      setStandings((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Silindi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Silinemedi", variant: "destructive" });
    }
  };

  const clubName = process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-400" />
            Puan Durumu Yönetimi
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{standings.length} takım</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
          >
            {["2024-2025", "2023-2024", "2022-2023"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />
            Takım Ekle
          </Button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Takım Ekle / Güncelle</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Takım Adı *", field: "teamName", type: "text", colSpan: "col-span-2" },
              { label: "Sıra", field: "position", type: "number" },
              { label: "Oynanan", field: "played", type: "number" },
              { label: "Galibiyet", field: "won", type: "number" },
              { label: "Beraberlik", field: "drawn", type: "number" },
              { label: "Mağlubiyet", field: "lost", type: "number" },
              { label: "Attığı Gol", field: "goalsFor", type: "number" },
              { label: "Yediği Gol", field: "goalsAgainst", type: "number" },
              { label: "Averaj", field: "goalDifference", type: "number" },
              { label: "Puan", field: "points", type: "number" },
            ].map((item) => (
              <div key={item.field} className={item.colSpan}>
                <label className="text-xs text-gray-400 block mb-1">{item.label}</label>
                <input
                  type={item.type}
                  value={form[item.field as keyof typeof form] as string | number}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    [item.field]: item.type === "number" ? parseInt(e.target.value) || 0 : e.target.value
                  }))}
                  className="w-full h-8 px-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleSave} loading={saving}>
              <Save className="w-3.5 h-3.5" />
              Kaydet
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </motion.div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Bu sezon için puan durumu eklenmedi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Takım</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">O</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">G</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">B</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">M</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">AG</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">YG</th>
                  <th className="text-center px-2 py-3 text-gray-400 font-medium">AV</th>
                  <th className="text-center px-3 py-3 text-gray-400 font-medium">P</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "border-b border-gray-800/50 last:border-0 transition-colors",
                      entry.teamName === clubName ? "bg-primary-900/20" : "hover:bg-gray-800/30"
                    )}
                  >
                    <td className="px-4 py-2.5 text-gray-400 text-center">{entry.position}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("text-sm font-medium", entry.teamName === clubName ? "text-primary-400" : "text-white")}>
                        {entry.teamName}
                      </span>
                    </td>
                    <td className="text-center px-2 py-2.5 text-gray-400">{entry.played}</td>
                    <td className="text-center px-2 py-2.5 text-green-400">{entry.won}</td>
                    <td className="text-center px-2 py-2.5 text-yellow-400">{entry.drawn}</td>
                    <td className="text-center px-2 py-2.5 text-red-400">{entry.lost}</td>
                    <td className="text-center px-2 py-2.5 text-gray-400">{entry.goalsFor}</td>
                    <td className="text-center px-2 py-2.5 text-gray-400">{entry.goalsAgainst}</td>
                    <td className="text-center px-2 py-2.5 text-gray-400">{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                    <td className="text-center px-3 py-2.5 font-bold text-white">{entry.points}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
