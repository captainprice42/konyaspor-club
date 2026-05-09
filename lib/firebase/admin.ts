/**
 * Firebase Admin SDK — SERVER SIDE ONLY
 *
 * CRITICAL SECURITY:
 * - This file must NEVER be imported in client components
 * - Never expose FIREBASE_ADMIN_PRIVATE_KEY to the browser
 * - Only use in: API routes, Server Actions, middleware
 *
 * The 'server-only' package enforces this at build time.
 */

import "server-only";

import {
  initializeApp,
  getApps,
  cert,
  App,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

function getAdminCredentials(): ServiceAccount {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // During build time, return placeholder — actual calls will fail gracefully
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
      throw new Error(
        "Missing Firebase Admin credentials. " +
          "Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, " +
          "and FIREBASE_ADMIN_PRIVATE_KEY are set in environment variables."
      );
    }
    // Return empty credentials for build-time static analysis
    return { projectId: "placeholder", clientEmail: "placeholder@placeholder.iam.gserviceaccount.com", privateKey: "placeholder" };
  }

  return {
    projectId,
    clientEmail,
    // Handle both escaped \n (from .env files) and real newlines (from Vercel dashboard/CLI)
    privateKey: privateKey.includes("\\n")
      ? privateKey.replace(/\\n/g, "\n")
      : privateKey,
  };
}

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

function getAdminApp(): App {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(getAdminCredentials()),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
    // Use timestamps for all Firestore reads
    adminDb.settings({ ignoreUndefinedProperties: true });
  }
  return adminDb;
}

export function getAdminStorage(): Storage {
  if (!adminStorage) {
    adminStorage = getStorage(getAdminApp());
  }
  return adminStorage;
}
