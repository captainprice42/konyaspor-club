import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FirestoreTimestamp } from "@/types";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { tr } from "date-fns/locale";

// ─── Tailwind class merger ────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Slug generation ─────────────────────────────────────────
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
}

// ─── Date formatting ─────────────────────────────────────────
export function formatDate(
  date: FirestoreTimestamp | Date | string | null | undefined,
  formatStr = "dd MMMM yyyy"
): string {
  if (!date) return "";

  let d: Date;
  if (date && typeof date === "object" && "toDate" in date) {
    d = (date as FirestoreTimestamp).toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date as string);
  }

  if (!isValid(d)) return "";
  return format(d, formatStr, { locale: tr });
}

export function formatDateTime(
  date: FirestoreTimestamp | Date | string | null | undefined
): string {
  return formatDate(date, "dd MMMM yyyy, HH:mm");
}

export function formatRelativeTime(
  date: FirestoreTimestamp | Date | string | null | undefined
): string {
  if (!date) return "";

  let d: Date;
  if (date && typeof date === "object" && "toDate" in date) {
    d = (date as FirestoreTimestamp).toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date as string);
  }

  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

export function timestampToDate(ts: FirestoreTimestamp | null | undefined): Date | null {
  if (!ts) return null;
  return ts.toDate();
}

// ─── File utilities ───────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

// ─── String utilities ─────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// ─── Number utilities ─────────────────────────────────────────
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("tr-TR").format(num);
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── URL utilities ────────────────────────────────────────────
export function getAbsoluteUrl(path: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── Validation utilities ─────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Array utilities ──────────────────────────────────────────
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ─── Position labels ──────────────────────────────────────────
export const POSITION_LABELS: Record<string, string> = {
  goalkeeper: "Kaleci",
  defender: "Defans",
  midfielder: "Orta Saha",
  forward: "Forvet",
};

export const POSITION_SHORT: Record<string, string> = {
  goalkeeper: "K",
  defender: "D",
  midfielder: "OS",
  forward: "F",
};

export const CATEGORY_LABELS: Record<string, string> = {
  club: "Kulüp",
  match: "Maç",
  transfer: "Transfer",
  youth: "Altyapı",
  press: "Basın",
  fan: "Taraftar",
  announcement: "Duyuru",
};

export const COMPETITION_LABELS: Record<string, string> = {
  league: "Lig",
  cup: "Kupa",
  friendly: "Hazırlık",
  playoff: "Play-off",
  supercup: "Süper Kupa",
};

export const TRANSFER_TYPE_LABELS: Record<string, string> = {
  in: "Gelen Transfer",
  out: "Giden Transfer",
  loan_in: "Kiralık Geliş",
  loan_out: "Kiralık Gidiş",
  free: "Serbest Transfer",
};

export const SPONSOR_TIER_LABELS: Record<string, string> = {
  main: "Ana Sponsor",
  official: "Resmi Sponsor",
  technical: "Teknik Sponsor",
  media: "Medya Sponsoru",
};
