// ============================================================
// CORE TYPES - Production Grade Type System
// ============================================================

// Use a generic Timestamp interface compatible with both Firebase Admin and Client SDKs
export interface FirestoreTimestamp {
  toDate(): Date;
  toMillis(): number;
  seconds: number;
  nanoseconds: number;
}

// Use this type alias throughout the app
export type Timestamp = FirestoreTimestamp;

// ─── User & Auth ────────────────────────────────────────────
export type UserRole = "super_admin" | "admin" | "editor" | "viewer";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
  permissions: Permission[];
}

export type Permission =
  | "news:read"
  | "news:write"
  | "news:delete"
  | "players:read"
  | "players:write"
  | "players:delete"
  | "matches:read"
  | "matches:write"
  | "matches:delete"
  | "transfers:read"
  | "transfers:write"
  | "transfers:delete"
  | "sponsors:read"
  | "sponsors:write"
  | "sponsors:delete"
  | "media:read"
  | "media:write"
  | "media:delete"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "settings:read"
  | "settings:write";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "news:read", "news:write", "news:delete",
    "players:read", "players:write", "players:delete",
    "matches:read", "matches:write", "matches:delete",
    "transfers:read", "transfers:write", "transfers:delete",
    "sponsors:read", "sponsors:write", "sponsors:delete",
    "media:read", "media:write", "media:delete",
    "users:read", "users:write", "users:delete",
    "settings:read", "settings:write",
  ],
  admin: [
    "news:read", "news:write", "news:delete",
    "players:read", "players:write", "players:delete",
    "matches:read", "matches:write", "matches:delete",
    "transfers:read", "transfers:write", "transfers:delete",
    "sponsors:read", "sponsors:write", "sponsors:delete",
    "media:read", "media:write", "media:delete",
    "users:read",
    "settings:read",
  ],
  editor: [
    "news:read", "news:write",
    "players:read",
    "matches:read",
    "transfers:read",
    "media:read", "media:write",
  ],
  viewer: [
    "news:read",
    "players:read",
    "matches:read",
    "transfers:read",
    "media:read",
  ],
};

// ─── News ────────────────────────────────────────────────────
export type NewsStatus = "draft" | "published" | "scheduled" | "archived";
export type NewsCategory =
  | "club"
  | "match"
  | "transfer"
  | "youth"
  | "press"
  | "fan"
  | "announcement";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown/HTML
  coverImage: string | null;
  coverImageAlt: string;
  category: NewsCategory;
  tags: string[];
  status: NewsStatus;
  authorId: string;
  authorName: string;
  publishedAt: Timestamp | null;
  scheduledAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  featured: boolean;
  seo: SEOMeta;
}

// ─── Players ─────────────────────────────────────────────────
export type PlayerPosition =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward";
export type PlayerStatus = "active" | "injured" | "suspended" | "loaned";

export interface Player {
  id: string;
  name: string;
  slug: string;
  number: number;
  position: PlayerPosition;
  nationality: string;
  nationalityFlag: string;
  birthDate: Timestamp;
  height: number; // cm
  weight: number; // kg
  photo: string | null;
  bio: string;
  status: PlayerStatus;
  isActive: boolean;
  stats: PlayerStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  cleanSheets?: number; // for goalkeepers
}

// ─── Staff ───────────────────────────────────────────────────
export type StaffRole =
  | "head_coach"
  | "assistant_coach"
  | "goalkeeper_coach"
  | "fitness_coach"
  | "team_doctor"
  | "physiotherapist"
  | "analyst"
  | "director";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  nationality: string;
  photo: string | null;
  bio: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Matches ─────────────────────────────────────────────────
export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";
export type MatchCompetition =
  | "league"
  | "cup"
  | "friendly"
  | "playoff"
  | "supercup";

export interface Match {
  id: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  competition: MatchCompetition;
  season: string;
  matchday: number;
  venue: string;
  scheduledAt: Timestamp;
  status: MatchStatus;
  score: MatchScore | null;
  events: MatchEvent[];
  lineups: MatchLineup | null;
  stats: MatchStats | null;
  ticketUrl: string | null;
  broadcastInfo: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  isHome: boolean;
}

export interface MatchScore {
  home: number;
  away: number;
  halfTimeHome?: number;
  halfTimeAway?: number;
}

export interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "penalty";
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
}

export interface MatchLineup {
  home: LineupTeam;
  away: LineupTeam;
}

export interface LineupTeam {
  formation: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupPlayer {
  playerId: string;
  playerName: string;
  number: number;
  position: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  offsides: { home: number; away: number };
}

// ─── Standings ───────────────────────────────────────────────
export interface StandingEntry {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  season: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
  updatedAt: Timestamp;
}

// ─── Transfers ───────────────────────────────────────────────
export type TransferType = "in" | "out" | "loan_in" | "loan_out" | "free";
export type TransferStatus = "confirmed" | "rumour" | "completed";

export interface Transfer {
  id: string;
  playerName: string;
  playerPhoto: string | null;
  playerNationality: string;
  fromClub: string;
  toClub: string;
  type: TransferType;
  fee: string | null; // "€5M", "Free", "Undisclosed"
  status: TransferStatus;
  season: string;
  announcedAt: Timestamp;
  contractUntil: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Sponsors ────────────────────────────────────────────────
export type SponsorTier = "main" | "official" | "technical" | "media";

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  tier: SponsorTier;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Media ───────────────────────────────────────────────────
export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  description: string;
  category: string;
  tags: string[];
  uploadedBy: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // for videos, in seconds
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  images: string[]; // MediaItem IDs
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── SEO ─────────────────────────────────────────────────────
export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
}

// ─── Activity Log ────────────────────────────────────────────
export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "logout"
  | "upload"
  | "role_change";

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: ActivityAction;
  resource: string;
  resourceId: string | null;
  details: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Timestamp;
}

// ─── Site Settings ───────────────────────────────────────────
export interface SiteSettings {
  id: string;
  clubName: string;
  clubShortName: string;
  clubLogo: string | null;
  clubBadge: string | null;
  primaryColor: string;
  accentColor: string;
  foundedYear: number;
  stadium: string;
  city: string;
  country: string;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  maintenanceMode: boolean;
  updatedAt: Timestamp;
}

export interface SocialLinks {
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
}

export interface ContactInfo {
  email: string;
  phone: string | null;
  address: string;
  pressEmail: string | null;
}

// ─── API Response Types ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastDoc?: string; // Firestore cursor
}

// ─── Form Types ──────────────────────────────────────────────
export interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  status: NewsStatus;
  featured: boolean;
  scheduledAt?: Date | null;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    noIndex: boolean;
  };
}

export interface PlayerFormData {
  name: string;
  number: number;
  position: PlayerPosition;
  nationality: string;
  nationalityFlag: string;
  birthDate: Date;
  height: number;
  weight: number;
  bio: string;
  status: PlayerStatus;
  isActive: boolean;
}

export interface MatchFormData {
  homeTeamName: string;
  homeTeamShortName: string;
  awayTeamName: string;
  awayTeamShortName: string;
  competition: MatchCompetition;
  season: string;
  matchday: number;
  venue: string;
  scheduledAt: Date;
  status: MatchStatus;
  ticketUrl?: string;
  broadcastInfo?: string;
}
