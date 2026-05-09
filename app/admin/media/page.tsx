"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Search, Image as ImageIcon, Video, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { formatFileSize, formatRelativeTime, cn } from "@/lib/utils";
import type { MediaItem, MediaType } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
const MAX_SIZE_MB = 10;

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { request } = useAdminApi();
  const { getIdToken } = useAuth();
  const { toast } = useToast();

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request<MediaItem[]>("/api/media");
      setItems(data);
    } catch {
      toast({ title: "Hata", description: "Medya yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [request, toast]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Geçersiz dosya türü", description: `Desteklenen: ${ALLOWED_TYPES.join(", ")}`, variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: "Dosya çok büyük", description: `Maksimum ${MAX_SIZE_MB}MB`, variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Oturum süresi doldu");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^.]+$/, ""));
      formData.append("folder", "media");

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<{ id: string; url: string; type: MediaType }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.data);
          } else {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || "Yükleme başarısız"));
          }
        };
        xhr.onerror = () => reject(new Error("Ağ hatası"));
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      toast({ title: "Yüklendi!", description: file.name });
      await loadMedia();
    } catch (err: unknown) {
      toast({
        title: "Yükleme hatası",
        description: err instanceof Error ? err.message : "Bilinmeyen hata",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu medyayı silmek istediğinizden emin misiniz?")) return;
    try {
      await request(`/api/media/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast({ title: "Silindi" });
    } catch (err: unknown) {
      toast({ title: "Hata", description: err instanceof Error ? err.message : "Silinemedi", variant: "destructive" });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Medya Yönetimi</h1>
          <p className="text-gray-400 text-sm mt-0.5">{items.length} dosya</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
          <Upload className="w-4 h-4" />
          Dosya Yükle
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Yükleniyor...</span>
              <span className="text-sm text-primary-400 font-medium">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer",
          dragOver ? "border-primary-500 bg-primary-900/20" : "border-gray-700 hover:border-gray-600"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          Dosyaları buraya sürükleyin veya <span className="text-primary-400">tıklayın</span>
        </p>
        <p className="text-gray-600 text-xs mt-1">
          JPG, PNG, WebP, GIF, MP4 · Maks {MAX_SIZE_MB}MB
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            placeholder="Medya ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "image", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                typeFilter === t ? "bg-primary-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              {t === "image" && <ImageIcon className="w-3 h-3" />}
              {t === "video" && <Video className="w-3 h-3" />}
              {t === "all" ? "Tümü" : t === "image" ? "Görseller" : "Videolar"}
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
          {search ? "Arama sonucu bulunamadı." : "Henüz medya yüklenmedi."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "relative group rounded-xl overflow-hidden bg-gray-800 border-2 transition-all cursor-pointer",
                selected.has(item.id) ? "border-primary-500" : "border-transparent hover:border-gray-600"
              )}
              onClick={() => toggleSelect(item.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square relative">
                {item.type === "image" ? (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Video className="w-8 h-8 text-gray-600" />
                  </div>
                )}

                {/* Selection indicator */}
                {selected.has(item.id) && (
                  <div className="absolute inset-0 bg-primary-900/40 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary-400" />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <span className="text-white text-xs truncate flex-1">{item.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors ml-1 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
                <p className="text-gray-500 text-xs">{formatFileSize(item.fileSize)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
