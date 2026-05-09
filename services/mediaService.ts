import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import { sanitizeText, sanitizeFilename } from "@/lib/security/sanitize";
import type { MediaItem, MediaType } from "@/types";

const MAX_FILE_SIZE_BYTES =
  parseInt(process.env.MAX_FILE_SIZE_MB || "10") * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES ||
  "image/jpeg,image/png,image/webp,image/gif"
).split(",");

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

export function validateUpload(
  file: { size: number; type: string },
  mediaType: MediaType
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dosya boyutu ${process.env.MAX_FILE_SIZE_MB || 10}MB'ı geçemez`,
    };
  }

  const allowedTypes =
    mediaType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Desteklenmeyen dosya türü: ${file.type}`,
    };
  }

  return { valid: true };
}

export async function getMediaItems(options: {
  limit?: number;
  type?: MediaType;
  category?: string;
  isPublic?: boolean;
} = {}): Promise<MediaItem[]> {
  const { limit = 50, type, category, isPublic = true } = options;
  const db = getAdminDb();

  let query = db
    .collection(COLLECTIONS.MEDIA)
    .where("isPublic", "==", isPublic)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (type) {
    query = db
      .collection(COLLECTIONS.MEDIA)
      .where("isPublic", "==", isPublic)
      .where("type", "==", type)
      .orderBy("createdAt", "desc")
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MediaItem[];
}

export async function createMediaRecord(
  data: Omit<MediaItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection(COLLECTIONS.MEDIA).add({
    ...data,
    title: sanitizeText(data.title),
    description: sanitizeText(data.description),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteMediaRecord(id: string): Promise<void> {
  const db = getAdminDb();
  // Get the record first to delete from storage
  const doc = await db.collection(COLLECTIONS.MEDIA).doc(id).get();
  if (doc.exists) {
    const data = doc.data() as MediaItem;
    // Delete from Firebase Storage
    try {
      const storage = getAdminStorage();
      const bucket = storage.bucket();
      // Extract path from URL
      const urlPath = new URL(data.url).pathname;
      const filePath = decodeURIComponent(urlPath.split("/o/")[1]?.split("?")[0] || "");
      if (filePath) {
        await bucket.file(filePath).delete();
      }
    } catch {
      // Storage deletion failure shouldn't block DB deletion
      console.error("[MediaService] Storage deletion failed for:", id);
    }
    await db.collection(COLLECTIONS.MEDIA).doc(id).delete();
  }
}

export async function generateUploadPath(
  filename: string,
  folder: string,
  userId: string
): Promise<string> {
  const safe = sanitizeFilename(filename);
  const timestamp = Date.now();
  return `uploads/${folder}/${userId}/${timestamp}_${safe}`;
}
