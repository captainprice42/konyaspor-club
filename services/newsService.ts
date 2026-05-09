/**
 * News Service — Server-side Firestore operations
 * Used in Server Components and API routes.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { generateSlug } from "@/lib/utils";
import { sanitizeHtml, sanitizeText } from "@/lib/security/sanitize";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { NewsArticle, NewsStatus, NewsCategory } from "@/types";

interface GetNewsOptions {
  limit?: number;
  status?: NewsStatus;
  category?: NewsCategory;
  featured?: boolean;
  startAfter?: string;
}

export async function getPublishedNews(
  options: GetNewsOptions = {}
): Promise<NewsArticle[]> {
  const { limit = 10, category, featured, startAfter } = options;

  const db = getAdminDb();
  let query = db
    .collection(COLLECTIONS.NEWS)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit);

  if (category) {
    query = db
      .collection(COLLECTIONS.NEWS)
      .where("status", "==", "published")
      .where("category", "==", category)
      .orderBy("publishedAt", "desc")
      .limit(limit);
  }

  if (featured) {
    query = db
      .collection(COLLECTIONS.NEWS)
      .where("status", "==", "published")
      .where("featured", "==", true)
      .orderBy("publishedAt", "desc")
      .limit(limit);
  }

  if (startAfter) {
    const cursor = await db.collection(COLLECTIONS.NEWS).doc(startAfter).get();
    if (cursor.exists) {
      query = query.startAfter(cursor);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NewsArticle[];
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.NEWS)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as NewsArticle;
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.NEWS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as NewsArticle;
}

export async function getAllNewsAdmin(
  options: GetNewsOptions = {}
): Promise<NewsArticle[]> {
  const { limit = 50, status, category, startAfter } = options;

  const db = getAdminDb();
  let query = db
    .collection(COLLECTIONS.NEWS)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (status) {
    query = db
      .collection(COLLECTIONS.NEWS)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(limit);
  }

  if (startAfter) {
    const cursor = await db.collection(COLLECTIONS.NEWS).doc(startAfter).get();
    if (cursor.exists) {
      query = query.startAfter(cursor);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NewsArticle[];
}

export async function createNews(
  data: Omit<NewsArticle, "id" | "createdAt" | "updatedAt" | "viewCount">,
  authorId: string,
  authorName: string
): Promise<string> {
  const db = getAdminDb();

  // Generate unique slug
  let slug = data.slug || generateSlug(data.title);
  const existing = await db
    .collection(COLLECTIONS.NEWS)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!existing.empty) {
    slug = `${slug}-${Date.now()}`;
  }

  // Sanitize content
  const sanitizedContent = sanitizeHtml(data.content);
  const sanitizedTitle = sanitizeText(data.title);
  const sanitizedExcerpt = sanitizeText(data.excerpt);

  const docRef = await db.collection(COLLECTIONS.NEWS).add({
    ...data,
    slug,
    title: sanitizedTitle,
    excerpt: sanitizedExcerpt,
    content: sanitizedContent,
    authorId,
    authorName,
    viewCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    publishedAt:
      data.status === "published" ? FieldValue.serverTimestamp() : null,
  });

  return docRef.id;
}

export async function updateNews(
  id: string,
  data: Partial<NewsArticle>
): Promise<void> {
  const db = getAdminDb();

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Sanitize if content fields are being updated
  if (data.content) updateData.content = sanitizeHtml(data.content);
  if (data.title) updateData.title = sanitizeText(data.title);
  if (data.excerpt) updateData.excerpt = sanitizeText(data.excerpt);

  // Set publishedAt when publishing for the first time
  if (data.status === "published") {
    const existing = await db.collection(COLLECTIONS.NEWS).doc(id).get();
    if (existing.exists && !existing.data()?.publishedAt) {
      updateData.publishedAt = FieldValue.serverTimestamp();
    }
  }

  await db.collection(COLLECTIONS.NEWS).doc(id).update(updateData);
}

export async function deleteNews(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTIONS.NEWS).doc(id).delete();
}

export async function incrementViewCount(id: string): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(COLLECTIONS.NEWS)
    .doc(id)
    .update({ viewCount: FieldValue.increment(1) });
}

export async function getNewsCount(status?: NewsStatus): Promise<number> {
  const db = getAdminDb();
  let query = db.collection(COLLECTIONS.NEWS) as FirebaseFirestore.Query;
  if (status) {
    query = query.where("status", "==", status);
  }
  const snapshot = await query.count().get();
  return snapshot.data().count;
}
