import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeOrderDoc,
  subscribeOrderMessages,
  subscribeOrderLogs,
  uploadChatAttachment,
} from '../../services/chatRepository';
import { maskSensitiveData, hasExternalChannel } from '../../utils/masking';
import { ChatMessage, ChatOrderLog, TimelineItem } from './LiveChatTimeline';

export function useLiveChat(isOpen: boolean, orderId: string, initialShopName: string) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<ChatOrderLog[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState(initialShopName || 'Boutique Olmart');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mark messages as read & subscribe to shop name
  useEffect(() => {
    if (!isOpen || !orderId || !currentUser) return;

    const markAsRead = async () => {
      try {
        const token = await currentUser.getIdToken();
        await fetch('/api/v1/messages/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        });
      } catch {
        // Non-fatal
      }
    };
    markAsRead();

    const unsub = subscribeOrderDoc(orderId, (orderData) => {
      if (orderData?.shopName) setShopName(orderData.shopName);
    });
    return () => unsub();
  }, [isOpen, orderId, currentUser]);

  // Messages & Logs subscription
  useEffect(() => {
    if (!isOpen || !orderId || !currentUser) return;
    setLoading(true);

    const unsubMsgs = subscribeOrderMessages(
      orderId,
      (rawMsgs) => {
        setMessages(rawMsgs as unknown as ChatMessage[]);
        setLoading(false);
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 80);
      },
      () => setLoading(false)
    );

    const unsubLogs = subscribeOrderLogs(orderId, (rawLogs) => {
      setLogs(rawLogs.map((l) => ({ ...l, isLog: true })) as unknown as ChatOrderLog[]);
    });

    return () => {
      unsubMsgs();
      unsubLogs();
    };
  }, [isOpen, orderId, currentUser]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    const combined: TimelineItem[] = [
      ...messages.map((m) => {
        const ts = typeof m.createdAt === 'number' ? m.createdAt 
          : m.createdAt && typeof m.createdAt === 'object' && 'seconds' in m.createdAt && m.createdAt.seconds 
          ? m.createdAt.seconds * 1000 
          : Date.now();
        return { ...m, timestamp: ts, isLog: false as const };
      }),
      ...logs.map((l) => {
        const ts = typeof l.date === 'number' ? l.date 
          : l.date && typeof l.date === 'object' && 'seconds' in l.date && l.date.seconds 
          ? l.date.seconds * 1000 
          : Date.now();
        return { ...l, timestamp: ts, isLog: true as const };
      }),
    ];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, logs]);

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success(t("Numéro copié !"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newMessage.trim();
    if (!cleanText || !currentUser) return;

    if (hasExternalChannel(cleanText)) {
      setError(t("Sécurité OLMART : Le partage de coordonnées directes est interdit pour protéger votre garantie."));
      return;
    }

    const compliantText = maskSensitiveData(cleanText);
    setNewMessage('');
    setError('');

    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/v1/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId, text: compliantText }),
      });
      if (!res.ok) throw new Error("Erreur d'envoi");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    }
  };

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t("L'image dépasse 3 Mo."));
      return;
    }

    setUploading(true);
    try {
      const url = await uploadChatAttachment(file, orderId);
      const idToken = await currentUser.getIdToken();
      await fetch('/api/v1/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId, text: '', imageUrl: url }),
      });
    } catch {
      toast.error("Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return {
    currentUser,
    shopName,
    loading,
    error,
    newMessage,
    setNewMessage,
    setError,
    copied,
    uploading,
    reportingMessageId,
    setReportingMessageId,
    scrollRef,
    fileInputRef,
    timelineItems,
    handleCopyOrderId,
    handleSendMessage,
    handleSelectFile,
  };
}
