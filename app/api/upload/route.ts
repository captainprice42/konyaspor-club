import { NextRequest } from "next/server";
import { apiSuccess, apiError, apiRateLimited, withErrorHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/security/rateLimit";
import { getAdminStorage } from "@/lib/firebase/admin";
import { createMediaRecord, validateUpload, generateUploadPath } from "@/services/mediaService";
import { logActivity } from "@/lib/services/activityLog";
import type { MediaType } from "@/types";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10") * 1024 * 1024;

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Strict rate limiting for uploads
  const ip = getClientIp(req);
  const rl = await checkRateLimit({
    ...RATE_LIMIT_CONFIGS.upload,
    identifier: `upload_${ip}`,
  });
  if (!rl.allowed) return apiRateLimited(rl.resetAt);

  const session = await requirePermission(req, "media:write");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string || "";
  const description = formData.get("description") as string || "";
  const category = formData.get("category") as string || "general";
  const folder = formData.get("folder") as string || "media";

  if (!file) return apiError("Dosya bulunamadı", 400);

  // Validate file
  const mediaType: MediaType = file.type.startsWith("image/") ? "image" : "video";
  const validation = validateUpload({ size: file.size, type: file.type }, mediaType);
  if (!validation.valid) return apiError(validation.error!, 400);

  // Additional security: verify file magic bytes for images
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (mediaType === "image") {
    const isValidImage = checkImageMagicBytes(bytes, file.type);
    if (!isValidImage) {
      return apiError("Geçersiz dosya formatı. Dosya içeriği MIME türüyle eşleşmiyor.", 400);
    }
  }

  // Generate safe storage path
  const storagePath = await generateUploadPath(file.name, folder, session.uid);

  // Upload to Firebase Storage
  const storage = getAdminStorage();
  const bucket = storage.bucket();
  const fileRef = bucket.file(storagePath);

  await fileRef.save(Buffer.from(buffer), {
    metadata: {
      contentType: file.type,
      metadata: {
        uploadedBy: session.uid,
        originalName: file.name,
      },
    },
  });

  // Make file publicly readable
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  // Create Firestore record
  const mediaId = await createMediaRecord({
    title: title || file.name,
    type: mediaType,
    url: publicUrl,
    thumbnailUrl: mediaType === "image" ? publicUrl : null,
    description,
    category,
    tags: [],
    uploadedBy: session.uid,
    fileSize: file.size,
    mimeType: file.type,
    isPublic: true,
  });

  await logActivity({
    userId: session.uid,
    userEmail: session.email,
    action: "upload",
    resource: "media",
    resourceId: mediaId,
    details: `Dosya yüklendi: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    ipAddress: ip,
  });

  return apiSuccess({
    id: mediaId,
    url: publicUrl,
    type: mediaType,
  });
});

/**
 * Verify image magic bytes to prevent polyglot file attacks.
 * Checks actual file content against claimed MIME type.
 */
function checkImageMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) return false;

  switch (mimeType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );
    case "image/gif":
      return (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46
      );
    default:
      return false;
  }
}
