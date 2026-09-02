import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  Unsubscribe
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export interface IpLogItem {
  id: string;
  ipAddress?: string;
  userId?: string;
  userEmail?: string;
  path?: string;
  action?: string;
  userAgent?: string;
  timestamp?: string | number | Date | { toDate: () => Date };
  location?: {
    city?: string;
    country?: string;
  };
}

export async function fetchUserLoginHistory(userId: string, maxResults = 50): Promise<DocumentData[]> {
  try {
    const q = query(
      collection(db, "login_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "login_history");
    return [];
  }
}

export async function fetchCollectionSample(collectionName: string, maxResults = 100): Promise<DocumentData[]> {
  try {
    const q = query(collection(db, collectionName), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionName);
    return [];
  }
}

export async function fetchAdminDoc(collectionName: string, docId: string): Promise<DocumentData | null> {
  try {
    const ref = doc(db, collectionName, docId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${collectionName}/${docId}`);
    return null;
  }
}

export async function updateAdminDoc(collectionName: string, docId: string, updates: DocumentData): Promise<void> {
  try {
    const ref = doc(db, collectionName, docId);
    await updateDoc(ref, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

export async function addAdminDoc(collectionName: string, docData: DocumentData): Promise<string> {
  try {
    const ref = await addDoc(collection(db, collectionName), docData);
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
    throw err;
  }
}

export async function deleteAdminDoc(collectionName: string, docId: string): Promise<void> {
  try {
    const ref = doc(db, collectionName, docId);
    await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

export async function fetchDisputeOrdersCount(): Promise<number> {
  try {
    const q1 = query(collection(db, "orders"), where("status", "==", "RETURN_REQUESTED"));
    const q2 = query(collection(db, "orders"), where("status", "==", "DISPUTE_OPEN"));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    return snap1.size + snap2.size;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "orders/disputes");
    return 0;
  }
}

export async function fetchAdminActivities(maxResults = 10): Promise<DocumentData[]> {
  try {
    const q = query(collection(db, "admin_activities"), orderBy("createdAt", "desc"), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "admin_activities");
    return [];
  }
}

export async function fetchOrdersSample(maxResults = 50): Promise<DocumentData[]> {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "orders");
    return [];
  }
}

export async function fetchInternalNotifications(maxResults = 20): Promise<DocumentData[]> {
  try {
    const q = query(collection(db, "internal_notifications"), orderBy("createdAt", "desc"), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "internal_notifications");
    return [];
  }
}

export async function fetchIpLogsByIp(ipAddress: string, maxResults = 50): Promise<IpLogItem[]> {
  try {
    const q = query(
      collection(db, "ip_logs"),
      where("ipAddress", "==", ipAddress),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as IpLogItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "ip_logs");
    return [];
  }
}

export async function fetchSearchSynonymsDoc(): Promise<Record<string, string[]> | null> {
  const ref = doc(db, "search_synonyms", "global");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() as Record<string, string[]> : null;
}

export async function saveSearchSynonymsDoc(data: Record<string, string[]>): Promise<void> {
  const ref = doc(db, "search_synonyms", "global");
  await setDoc(ref, data, { merge: true });
}

export async function fetchSearchAnalyticsLogs(maxResults = 100): Promise<DocumentData[]> {
  const q = query(collection(db, "search_analytics"), orderBy("timestamp", "desc"), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchAdminSettingsDoc(docId: string): Promise<DocumentData | null> {
  const ref = doc(db, "settings", docId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveAdminSettingsDoc(docId: string, data: DocumentData): Promise<void> {
  const ref = doc(db, "settings", docId);
  await setDoc(ref, data, { merge: true });
}

export function subscribeSiteLogs(
  onData: (logs: DocumentData[]) => void,
  onError?: (err: Error) => void,
  maxResults = 100
): Unsubscribe {
  const q = query(collection(db, "site_logs"), orderBy("timestamp", "desc"), limit(maxResults));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function updateSiteLogStatus(logId: string, updates: DocumentData): Promise<void> {
  const ref = doc(db, "site_logs", logId);
  await updateDoc(ref, updates);
}

export function subscribeSponsorships(
  onData: (items: DocumentData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "sponsorships"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export function subscribeMarketingCampaigns(
  onData: (items: DocumentData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "marketing_campaigns"), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function fetchCheckoutAudits(maxResults = 50): Promise<DocumentData[]> {
  const q = query(collection(db, "checkout_audits"), orderBy("timestamp", "desc"), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addCheckoutAuditLog(logData: DocumentData): Promise<string> {
  const ref = await addDoc(collection(db, "checkout_audits"), {
    ...logData,
    timestamp: serverTimestamp()
  });
  return ref.id;
}
