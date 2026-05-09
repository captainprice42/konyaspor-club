"use client";

/**
 * useAuth Hook — Client-side authentication state
 * Manages Firebase Auth state and syncs with Firestore user record.
 */

import { useState, useEffect, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AppUser } from "@/types";

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    appUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous Firestore listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (!firebaseUser) {
        setState({ user: null, appUser: null, loading: false, error: null });
        // Clear session cookie
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
        return;
      }

      // Set session cookie for middleware
      try {
        const token = await firebaseUser.getIdToken();
        document.cookie = `__session=${token}; path=/; SameSite=Strict; Secure; max-age=3600`;
      } catch {
        // Non-critical
      }

      // Subscribe to Firestore user document for real-time role updates
      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      unsubscribeFirestore = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setState({
              user: firebaseUser,
              appUser: null,
              loading: false,
              error: "Kullanıcı profili bulunamadı",
            });
            return;
          }

          const appUser = snapshot.data() as AppUser;

          if (!appUser.isActive) {
            firebaseSignOut(auth);
            setState({
              user: null,
              appUser: null,
              loading: false,
              error: "Hesabınız devre dışı bırakılmıştır",
            });
            return;
          }

          setState({
            user: firebaseUser,
            appUser,
            loading: false,
            error: null,
          });
        },
        (error) => {
          console.error("[useAuth] Firestore listener error:", error);
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Kullanıcı bilgileri yüklenemedi",
          }));
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const message = getAuthErrorMessage(error);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("[useAuth] Sign out error:", error);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!state.user) return null;
    try {
      return await state.user.getIdToken();
    } catch {
      return null;
    }
  }, [state.user]);

  return {
    ...state,
    signIn,
    signOut,
    resetPassword,
    getIdToken,
    isAdmin:
      state.appUser?.role === "admin" ||
      state.appUser?.role === "super_admin" ||
      false,
    isSuperAdmin: state.appUser?.role === "super_admin" || false,
  };
}

function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    const messages: Record<string, string> = {
      "auth/user-not-found": "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı",
      "auth/wrong-password": "Hatalı şifre",
      "auth/invalid-email": "Geçersiz e-posta adresi",
      "auth/user-disabled": "Bu hesap devre dışı bırakılmıştır",
      "auth/too-many-requests": "Çok fazla başarısız giriş denemesi. Lütfen bekleyin",
      "auth/network-request-failed": "Ağ bağlantısı hatası",
      "auth/invalid-credential": "Geçersiz kimlik bilgileri",
    };
    return messages[code] || "Giriş yapılırken hata oluştu";
  }
  return "Giriş yapılırken hata oluştu";
}
