/**
 * Firestore Collection Constants
 * Centralized collection names to prevent typos and enable easy refactoring.
 */

export const COLLECTIONS = {
  USERS: "users",
  NEWS: "news",
  PLAYERS: "players",
  STAFF: "staff",
  MATCHES: "matches",
  STANDINGS: "standings",
  TRANSFERS: "transfers",
  SPONSORS: "sponsors",
  MEDIA: "media",
  GALLERIES: "galleries",
  ACTIVITY_LOGS: "activity_logs",
  SETTINGS: "settings",
  RATE_LIMITS: "rate_limits",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// Sub-collection names
export const SUB_COLLECTIONS = {
  MATCH_EVENTS: "events",
} as const;
