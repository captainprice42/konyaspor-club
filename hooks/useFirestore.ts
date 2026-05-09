"use client";

/**
 * Generic Firestore hooks for real-time data fetching.
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  doc,
  FirestoreError,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

interface UseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

interface UseDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Real-time collection listener with query constraints.
 */
export function useCollection<T extends { id: string }>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): UseCollectionResult<T> {
  const [state, setState] = useState<UseCollectionResult<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const db = getFirebaseDb();
    const ref = collection(db, collectionPath);
    const q = query(ref, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setState({ data, loading: false, error: null });
      },
      (error: FirestoreError) => {
        console.error(`[useCollection] ${collectionPath}:`, error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Veri yüklenirken hata oluştu",
        }));
      }
    );

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(constraints)]);

  return state;
}

/**
 * Real-time document listener.
 */
export function useDocument<T extends { id: string }>(
  collectionPath: string,
  docId: string | null | undefined
): UseDocumentResult<T> {
  const [state, setState] = useState<UseDocumentResult<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!docId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const db = getFirebaseDb();
    const ref = doc(db, collectionPath, docId);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setState({ data: null, loading: false, error: null });
          return;
        }
        setState({
          data: { id: snapshot.id, ...snapshot.data() } as T,
          loading: false,
          error: null,
        });
      },
      (error: FirestoreError) => {
        console.error(`[useDocument] ${collectionPath}/${docId}:`, error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Veri yüklenirken hata oluştu",
        }));
      }
    );

    return () => unsubscribe();
  }, [collectionPath, docId]);

  return state;
}
