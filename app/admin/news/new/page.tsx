"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, X, Tag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { generateSlug, CATEGORY_LABELS, cn } from "@/lib/utils";
import type { NewsCategory, NewsStatus } from "@/types";
import Link from "next/link";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  status: NewsStatus;
  featured: boolean;
  tagInput: string;
  seoTitle: string;
  seoDescription: string;
}

export default function NewNewsPage() {
  const router = useRouter();
  const { request } = useAdminApi();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "club",
    tags: [],
    status: "draft",
    featured: false,
    tagInput: "",
    seoTitle: "",
    seoDescription: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const update = (field: keyof FormState, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from title
      if (field === "title" && !prev.slug) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addTag = () => {
    const tag = form.tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      update("tags", [...form.tags, tag]);
      update("tagInput", "");
    }
  };

  const removeTag = (tag: string) => {
    update("tags", form.tags.filter((t) => t !== tag));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim() || form.title.length < 5)
      newErrors.title = "Başlık en az 5 karakter olmalıdır";
    if (!form.excerpt.trim() || form.excerpt.length < 10)
      newErrors.excerpt = "Özet en az 10 karakter olmalıdır";
    if (!form.content.trim() || form.content.length < 50)
      newErrors.content = "İçerik en az 50 karakter olmalıdır";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: NewsStatus = form.status) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        tags: form.tags,
        status,
        featured: form.featured,
        coverImageAlt: form.title,
        seo: {
          title: form.seoTitle || form.title,
          description: form.seoDescription || form.excerpt,
          keywords: form.tags,
          noIndex: false,
        },
      };

      const result = await request<{ id: string }>("/api/news", {
        method: "POST",
        body: payload,
      });

      toast({
        title: status === "published" ? "Yayınlandı!" : "Kaydedildi",
        description: form.title,
      });

      router.push(`/admin/news/${result.id}/edit`);
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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/news"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Yeni Haber</h1>
            <p className="text-gray-500 text-xs mt-0.5">Yeni bir haber makalesi oluşturun</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            loading={saving}
            disabled={saving}
          >
            <Save className="w-3.5 h-3.5" />
            Taslak Kaydet
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            loading={saving}
            disabled={saving}
          >
            <Eye className="w-3.5 h-3.5" />
            Yayınla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {(["content", "seo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-primary-700 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {tab === "content" ? "İçerik" : "SEO"}
              </button>
            ))}
          </div>

          {activeTab === "content" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Başlık <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Haber başlığını girin..."
                    className={cn(
                      "w-full h-11 px-4 rounded-lg bg-gray-800 border text-white placeholder-gray-500 text-lg font-medium",
                      "focus:outline-none focus:border-primary-500 transition-colors",
                      errors.title ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">/haberler/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => update("slug", e.target.value)}
                      placeholder="haber-url-slug"
                      className="flex-1 h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Özet <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => update("excerpt", e.target.value)}
                    placeholder="Haberin kısa özeti (liste görünümünde gösterilir)..."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg bg-gray-800 border text-white placeholder-gray-500 text-sm resize-none",
                      "focus:outline-none focus:border-primary-500 transition-colors",
                      errors.excerpt ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.excerpt && (
                    <p className="text-red-400 text-xs mt-1">{errors.excerpt}</p>
                  )}
                </div>
              </div>

              {/* Content editor */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <label className="text-sm font-medium text-gray-300 block mb-3">
                  İçerik <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => update("content", e.target.value)}
                  placeholder="Haber içeriğini buraya yazın... (HTML desteklenir)"
                  rows={20}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-gray-800 border text-white placeholder-gray-500 text-sm font-mono resize-y",
                    "focus:outline-none focus:border-primary-500 transition-colors",
                    errors.content ? "border-red-500" : "border-gray-700"
                  )}
                />
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                )}
                <p className="text-gray-600 text-xs mt-2">
                  {form.content.length} karakter
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">
                  SEO Başlığı
                  <span className="text-gray-500 ml-2 text-xs">
                    ({form.seoTitle.length}/60)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  placeholder={form.title || "SEO başlığı..."}
                  maxLength={60}
                  className="w-full h-10 px-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">
                  Meta Açıklama
                  <span className="text-gray-500 ml-2 text-xs">
                    ({form.seoDescription.length}/160)
                  </span>
                </label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  placeholder={form.excerpt || "Meta açıklama..."}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              {/* Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Google Önizleme</p>
                <p className="text-blue-400 text-sm font-medium line-clamp-1">
                  {form.seoTitle || form.title || "Sayfa Başlığı"}
                </p>
                <p className="text-green-600 text-xs mt-0.5">
                  {process.env.NEXT_PUBLIC_APP_URL || "https://konyaspor.example.com"}/haberler/{form.slug || "haber-slug"}
                </p>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {form.seoDescription || form.excerpt || "Meta açıklama burada görünür..."}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Yayın Ayarları</h3>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Durum</label>
              <Select
                value={form.status}
                onValueChange={(v) => update("status", v as NewsStatus)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="published">Yayında</SelectItem>
                  <SelectItem value="scheduled">Planlandı</SelectItem>
                  <SelectItem value="archived">Arşiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Kategori</label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v as NewsCategory)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">Öne çıkan haber</span>
            </label>
          </div>

          {/* Tags */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Etiketler</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.tagInput}
                onChange={(e) => update("tagInput", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Etiket ekle..."
                className="flex-1 h-8 px-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={addTag}
                className="px-3 h-8 bg-primary-700 hover:bg-primary-600 text-white rounded-lg text-xs transition-colors"
              >
                <Tag className="w-3 h-3" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover image placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Kapak Görseli</h3>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
              <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                Görsel yüklemek için{" "}
                <Link href="/admin/media" className="text-primary-400 hover:underline">
                  Medya Yönetimi
                </Link>
                'ni kullanın
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
