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
  const followDoc = await getDoc(doc(db, "users", userId, "followed_stores", storeId));
  return followDoc.exists();
}

export async function toggleStoreFollow(storeId: string, userId: string, follow: boolean): Promise<void> {
  const userFollowRef = doc(db, "users", userId, "followed_stores", storeId);
  const storeRef = doc(db, "shops", storeId);

  if (follow) {
    await setDoc(userFollowRef, { followedAt: new Date().toISOString() });
    await updateDoc(storeRef, { followersCount: increment(1) });
  } else {
    await deleteDoc(userFollowRef);
    await updateDoc(storeRef, { followersCount: increment(-1) });
  }
}

export async function updateOrderDocument(orderId: string, updates: DocumentData): Promise<void> {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, updates);
}
