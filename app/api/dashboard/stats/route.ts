import { NextRequest } from "next/server";
import { apiSuccess, withErrorHandler } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireRole(req, "editor");
  const db = getAdminDb();

  // Parallel count queries
  const [newsSnap, playersSnap, matchesSnap, transfersSnap, usersSnap] =
    await Promise.all([
      db.collection(COLLECTIONS.NEWS).count().get(),
      db.collection(COLLECTIONS.PLAYERS).where("isActive", "==", true).count().get(),
      db.collection(COLLECTIONS.MATCHES).count().get(),
      db.collection(COLLECTIONS.TRANSFERS).count().get(),
      db.collection(COLLECTIONS.USERS).count().get(),
    ]);

  // Published news count
  const publishedSnap = await db
    .collection(COLLECTIONS.NEWS)
    .where("status", "==", "published")
    .count()
    .get();

  // Upcoming matches
  const { Timestamp } = await import("firebase-admin/firestore");
  const upcomingSnap = await db
    .collection(COLLECTIONS.MATCHES)
    .where("status", "==", "scheduled")
    .where("scheduledAt", ">=", Timestamp.now())
    .count()
    .get();

  return apiSuccess({
    news: {
      total: newsSnap.data().count,
      published: publishedSnap.data().count,
    },
    players: playersSnap.data().count,
    matches: {
      total: matchesSnap.data().count,
      upcoming: upcomingSnap.data().count,
    },
    transfers: transfersSnap.data().count,
    users: usersSnap.data().count,
  });
});
