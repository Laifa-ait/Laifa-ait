import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  DocumentData
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { apiGet, apiPost } from "../lib/api";

export async function fetchPublicShops(maxResults = 50): Promise<DocumentData[]> {
  const q = query(collection(db, "shops"), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchStoreBySlug(slug: string): Promise<DocumentData | null> {
  const q = query(collection(db, "shops"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  const directDoc = await getDoc(doc(db, "shops", slug));
  if (directDoc.exists()) {
    return { id: directDoc.id, ...directDoc.data() };
  }
  return null;
}

export async function checkStoreFollowStatus(storeId: string, userId: string): Promise<boolean> {
  // 1. Try server-side authorized endpoint first
  try {
    const res = await apiGet<{ isFollowing: boolean }>(`/api/v1/buyer/follow-status/${encodeURIComponent(storeId)}`);
    if (res && typeof res.isFollowing === "boolean") {
      return res.isFollowing;
    }
  } catch {
    // API endpoint unavailable or unauthenticated, fallback to client Firestore check
  }

  // 2. Client Firestore fallback
  try {
    const followDoc = await getDoc(doc(db, "users", userId, "following", storeId));
    if (followDoc.exists()) {
      return true;
    }
    const legacyDoc = await getDoc(doc(db, "users", userId, "followed_stores", storeId));
    return legacyDoc.exists();
  } catch {
    return false;
  }
}

export async function toggleStoreFollow(
  storeId: string,
  userId: string,
  follow: boolean,
  extraPayload?: { name?: string; logo?: string | null; location?: string }
): Promise<void> {
  // 1. Try server-side authorized endpoint first
  try {
    if (follow) {
      const followPayload = {
        sellerId: storeId,
        name: extraPayload?.name || "Boutique",
        logo: extraPayload?.logo || null,
        location: extraPayload?.location || "Algérie",
        followedAt: new Date().toISOString(),
      };
      await apiPost("/api/v1/buyer/follow", { sellerId: storeId, followPayload });
    } else {
      await apiPost("/api/v1/buyer/unfollow", { sellerId: storeId });
    }
    return;
  } catch {
    // Fallback to client-side Firestore operations if backend API is not reachable
  }

  // 2. Direct Firestore fallback
  const userFollowingRef = doc(db, "users", userId, "following", storeId);
  const userLegacyRef = doc(db, "users", userId, "followed_stores", storeId);
  const storeRef = doc(db, "shops", storeId);

  if (follow) {
    const payload = { followedAt: new Date().toISOString() };
    await setDoc(userFollowingRef, payload);
    try {
      await setDoc(userLegacyRef, payload);
    } catch {
      // Ignore if legacy subcollection is restricted
    }
    try {
      await updateDoc(storeRef, { followersCount: increment(1) });
    } catch {
      // Ignore if direct shop updates are admin/server only
    }
  } else {
    await deleteDoc(userFollowingRef);
    try {
      await deleteDoc(userLegacyRef);
    } catch {
      // Ignore
    }
    try {
      await updateDoc(storeRef, { followersCount: increment(-1) });
    } catch {
      // Ignore
    }
  }
}

export async function updateOrderDocument(orderId: string, updates: DocumentData): Promise<void> {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, updates);
}
