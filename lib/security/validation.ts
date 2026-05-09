/**
 * Zod Validation Schemas
 * All API inputs are validated against these schemas before processing.
 */

import { z } from "zod";

// ─── Common ───────────────────────────────────────────────────
const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir");

const urlSchema = z
  .string()
  .url("Geçerli bir URL giriniz")
  .max(500)
  .optional()
  .nullable();

const seoSchema = z.object({
  title: z.string().max(60, "SEO başlığı 60 karakteri geçemez").optional().default(""),
  description: z.string().max(160, "SEO açıklaması 160 karakteri geçemez").optional().default(""),
  keywords: z.array(z.string().max(50)).max(10).optional().default([]),
  noIndex: z.boolean().optional().default(false),
  ogImage: z.string().nullable().optional().default(null),
  canonicalUrl: z.string().nullable().optional().default(null),
});

// ─── News ─────────────────────────────────────────────────────
export const newsCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Başlık en az 5 karakter olmalıdır")
    .max(200, "Başlık 200 karakteri geçemez"),
  slug: slugSchema.optional(),
  excerpt: z
    .string()
    .min(10, "Özet en az 10 karakter olmalıdır")
    .max(500, "Özet 500 karakteri geçemez"),
  content: z.string().min(50, "İçerik en az 50 karakter olmalıdır"),
  category: z.enum(["club", "match", "transfer", "youth", "press", "fan", "announcement"]),
  tags: z.array(z.string().max(50)).max(10).default([]),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  scheduledAt: z.string().datetime().nullable().optional(),
  coverImageAlt: z.string().max(200).default(""),
  seo: seoSchema.optional().default(() => ({
    title: "",
    description: "",
    keywords: [],
    noIndex: false,
    ogImage: null,
    canonicalUrl: null,
  })),
});

export const newsUpdateSchema = newsCreateSchema.partial();

// ─── Player ───────────────────────────────────────────────────
export const playerCreateSchema = z.object({
  name: z.string().min(2).max(100),
  number: z.number().int().min(1).max(99),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward"]),
  nationality: z.string().min(2).max(100),
  nationalityFlag: z.string().max(10).default(""),
  birthDate: z.string().datetime(),
  height: z.number().int().min(140).max(220),
  weight: z.number().int().min(50).max(150),
  bio: z.string().max(2000).default(""),
  status: z.enum(["active", "injured", "suspended", "loaned"]).default("active"),
  isActive: z.boolean().default(true),
});

export const playerUpdateSchema = playerCreateSchema.partial();

// ─── Match ────────────────────────────────────────────────────
export const matchCreateSchema = z.object({
  homeTeamName: z.string().min(2).max(100),
  homeTeamShortName: z.string().min(2).max(10),
  homeTeamLogo: z.string().nullable().optional(),
  awayTeamName: z.string().min(2).max(100),
  awayTeamShortName: z.string().min(2).max(10),
  awayTeamLogo: z.string().nullable().optional(),
  competition: z.enum(["league", "cup", "friendly", "playoff", "supercup"]),
  season: z.string().regex(/^\d{4}-\d{4}$/, "Sezon formatı: 2024-2025"),
  matchday: z.number().int().min(1).max(50),
  venue: z.string().min(2).max(200),
  scheduledAt: z.string().datetime(),
  status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]).default("scheduled"),
  ticketUrl: urlSchema,
  broadcastInfo: z.string().max(200).optional().nullable(),
});

export const matchUpdateSchema = matchCreateSchema.partial();

export const matchScoreSchema = z.object({
  home: z.number().int().min(0).max(50),
  away: z.number().int().min(0).max(50),
  halfTimeHome: z.number().int().min(0).max(50).optional(),
  halfTimeAway: z.number().int().min(0).max(50).optional(),
});

// ─── Transfer ─────────────────────────────────────────────────
export const transferCreateSchema = z.object({
  playerName: z.string().min(2).max(100),
  playerNationality: z.string().min(2).max(100),
  fromClub: z.string().min(2).max(100),
  toClub: z.string().min(2).max(100),
  type: z.enum(["in", "out", "loan_in", "loan_out", "free"]),
  fee: z.string().max(50).nullable().optional(),
  status: z.enum(["confirmed", "rumour", "completed"]).default("confirmed"),
  season: z.string().regex(/^\d{4}-\d{4}$/),
  announcedAt: z.string().datetime(),
  contractUntil: z.string().max(20).nullable().optional(),
});

export const transferUpdateSchema = transferCreateSchema.partial();

// ─── Sponsor ──────────────────────────────────────────────────
export const sponsorCreateSchema = z.object({
  name: z.string().min(2).max(100),
  website: urlSchema,
  tier: z.enum(["main", "official", "technical", "media"]),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(100).default(0),
});

export const sponsorUpdateSchema = sponsorCreateSchema.partial();

// ─── Staff ────────────────────────────────────────────────────
export const staffCreateSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.enum([
    "head_coach", "assistant_coach", "goalkeeper_coach",
    "fitness_coach", "team_doctor", "physiotherapist", "analyst", "director",
  ]),
  nationality: z.string().min(2).max(100),
  bio: z.string().max(2000).default(""),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(100).default(0),
});

export const staffUpdateSchema = staffCreateSchema.partial();

// ─── User Management ──────────────────────────────────────────
export const userRoleUpdateSchema = z.object({
  userId: z.string().min(1).max(128),
  role: z.enum(["super_admin", "admin", "editor", "viewer"]),
});

export const userStatusUpdateSchema = z.object({
  userId: z.string().min(1).max(128),
  isActive: z.boolean(),
});

// ─── Upload ───────────────────────────────────────────────────
export const uploadMetaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  category: z.string().max(50).default("general"),
  tags: z.array(z.string().max(50)).max(10).default([]),
  isPublic: z.boolean().default(true),
});

// ─── Settings ─────────────────────────────────────────────────
export const siteSettingsSchema = z.object({
  clubName: z.string().min(2).max(100),
  clubShortName: z.string().min(2).max(20),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()),
  stadium: z.string().max(200),
  city: z.string().max(100),
  country: z.string().max(100),
  socialLinks: z.object({
    twitter: urlSchema,
    instagram: urlSchema,
    facebook: urlSchema,
    youtube: urlSchema,
    tiktok: urlSchema,
  }),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().max(20).nullable().optional(),
    address: z.string().max(500),
    pressEmail: z.string().email().nullable().optional(),
  }),
  maintenanceMode: z.boolean().default(false),
});

// Type exports
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type TransferCreateInput = z.infer<typeof transferCreateSchema>;
export type SponsorCreateInput = z.infer<typeof sponsorCreateSchema>;
export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
