/**
 * Firebase Client SDK Configuration
 * 
 * SECURITY: Only NEXT_PUBLIC_ prefixed variables are exposed to the browser.
 * These are safe to expose as they are restricted by Firebase Security Rules
 * and domain whitelisting in the Firebase Console.
 * 
 * NEVER import firebase-admin here — admin SDK is server-side only.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required config at startup — only in runtime, not during build
const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
  for (const key of requiredKeys) {
    if (!firebaseConfig[key]) {
      console.warn(
        `Missing Firebase config: NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}. Check your .env.local file.`
      );
    }
  }
}

// Singleton pattern — prevents re-initialization on hot reload
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());

    // Connect to emulator in development
    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
    ) {
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());

    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
    ) {
      connectFirestoreEmulator(db, "localhost", 8080);
    }
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());

    if (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
    ) {
      connectStorageEmulator(storage, "localhost", 9199);
    }
  }
  return storage;
}

// Convenience exports
export { getFirebaseApp as firebaseApp };
