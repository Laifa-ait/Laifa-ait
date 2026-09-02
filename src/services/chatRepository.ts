import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  DocumentData,
  Unsubscribe
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { uploadFile } from "./storage.service";

export function subscribeLiveChatMessages(
  chatId: string,
  onData: (messages: DocumentData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function fetchChatMessageDoc(chatId: string, messageId: string): Promise<DocumentData | null> {
  const ref = doc(db, "chats", chatId, "messages", messageId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export function subscribeOrderDoc(
  orderId: string,
  onData: (data: DocumentData | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const orderRef = doc(db, "orders", orderId);
  return onSnapshot(orderRef, (snap) => {
    onData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, onError);
}

export function subscribeOrderMessages(
  orderId: string,
  onData: (messages: DocumentData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "orders", orderId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export function subscribeOrderLogs(
  orderId: string,
  onData: (logs: DocumentData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, "orders", orderId, "order_logs"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function uploadChatAttachment(orderId: string, file: File): Promise<string> {
  return uploadFile(`chat_images/${orderId}/${Date.now()}_${file.name}`, file);
}
