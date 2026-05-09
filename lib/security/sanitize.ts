/**
 * Input Sanitization & XSS Protection
 *
 * All user-provided content must pass through these functions
 * before being stored in Firestore or rendered as HTML.
 */

// Simple HTML entity encoding for plain text fields
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// Strip all HTML tags — for fields that should be plain text
export function stripAllHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

// Allowed HTML tags for rich content (news articles)
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "code", "pre", "hr",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

// Sanitize rich HTML content — removes dangerous tags/attributes
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "");

  // Remove disallowed tags while keeping content
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const lowerTag = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return ""; // Remove disallowed tags entirely
    }
    return match;
  });

  // Sanitize href attributes to prevent javascript: URLs
  sanitized = sanitized.replace(
    /href\s*=\s*["']([^"']*)["']/gi,
    (match, url) => {
      const cleanUrl = url.trim().toLowerCase();
      if (cleanUrl.startsWith("javascript:") || cleanUrl.startsWith("vbscript:")) {
        return 'href="#"';
      }
      return match;
    }
  );

  // Force rel="noopener noreferrer" on external links
  sanitized = sanitized.replace(
    /<a\s([^>]*href\s*=\s*["']https?:\/\/[^"']*["'][^>]*)>/gi,
    (match) => {
      if (!match.includes("rel=")) {
        return match.replace(">", ' rel="noopener noreferrer" target="_blank">');
      }
      return match;
    }
  );

  return sanitized.trim();
}

// Sanitize slug — only allow alphanumeric and hyphens
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

// Sanitize filename for storage uploads
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 255);
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// Sanitize object recursively — for API request bodies
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
