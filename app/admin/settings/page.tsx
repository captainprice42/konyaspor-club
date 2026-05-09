"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Settings, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const { request } = useAdminApi();
  const { toast } = useToast();

  const [form, setForm] = useState({
    clubName: process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor",
    clubShortName: "KNY",
    foundedYear: 1922,
    stadium: "Konya Büyükşehir Stadyumu",
    city: "Konya",
    country: "Türkiye",
    email: "info@konyaspor.example",
    phone: "+90 332 000 00 00",
    address: "Konya, Türkiye",
    pressEmail: "basin@konyaspor.example",
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    maintenanceMode: false,
  });

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await request("/api/settings", {
        method: "POST",
        body: {
          clubName: form.clubName,
          clubShortName: form.clubShortName,
          foundedYear: form.foundedYear,
          stadium: form.stadium,
          city: form.city,
          country: form.country,
          socialLinks: {
            twitter: form.twitter || null,
            instagram: form.instagram || null,
            facebook: form.facebook || null,
            youtube: form.youtube || null,
            tiktok: null,
          },
          contactInfo: {
            email: form.email,
            phone: form.phone || null,
            address: form.address,
            pressEmail: form.pressEmail || null,
          },
          maintenanceMode: form.maintenanceMode,
        },
      });
      toast({ title: "Ayarlar kaydedildi" });
    } catch (err: unknown) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard minRole="admin">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-400" />
              Site Ayarları
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Kulüp ve site genel ayarları</p>
          </div>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Kaydet
          </Button>
        </div>

        <div className="space-y-6">
          {/* Club info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Kulüp Bilgileri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Kulüp Adı", field: "clubName", type: "text" },
                { label: "Kısa Ad", field: "clubShortName", type: "text" },
                { label: "Kuruluş Yılı", field: "foundedYear", type: "number" },
                { label: "Stadyum", field: "stadium", type: "text" },
                { label: "Şehir", field: "city", type: "text" },
                { label: "Ülke", field: "country", type: "text" },
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-xs text-gray-400 block mb-1.5">{item.label}</label>
                  <input
                    type={item.type}
                    value={form[item.field as keyof typeof form] as string}
                    onChange={(e) => update(item.field, item.type === "number" ? parseInt(e.target.value) : e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-400" />
              İletişim Bilgileri
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "E-posta", field: "email" },
                { label: "Basın E-postası", field: "pressEmail" },
                { label: "Telefon", field: "phone" },
                { label: "Adres", field: "address" },
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-xs text-gray-400 block mb-1.5">{item.label}</label>
                  <input
                    type="text"
                    value={form[item.field as keyof typeof form] as string}
                    onChange={(e) => update(item.field, e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-400" />
              Sosyal Medya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Twitter / X", field: "twitter", placeholder: "https://twitter.com/..." },
                { label: "Instagram", field: "instagram", placeholder: "https://instagram.com/..." },
                { label: "Facebook", field: "facebook", placeholder: "https://facebook.com/..." },
                { label: "YouTube", field: "youtube", placeholder: "https://youtube.com/..." },
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-xs text-gray-400 block mb-1.5">{item.label}</label>
                  <input
                    type="url"
                    value={form[item.field as keyof typeof form] as string}
                    onChange={(e) => update(item.field, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500 placeholder-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance mode */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">Bakım Modu</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Aktif edildiğinde site ziyaretçilere bakım sayfası gösterilir.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => update("maintenanceMode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
