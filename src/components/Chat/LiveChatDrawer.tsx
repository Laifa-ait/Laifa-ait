import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  User, 
  Loader2, 
  MessageCircle, 
  AlertTriangle, 
  CheckCheck, 
  Info, 
  Sparkles,
  Store,
  Copy,
  Check,
  Paperclip,
  Flag,
  AlertCircle
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { maskSensitiveData, hasExternalChannel } from "../../utils/masking";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  senderId: string;
  imageUrl?: string;
  createdAt: { toDate?: () => Date; seconds?: number } | number | string | null;
  isLog?: boolean;
  flagged?: boolean;
  flaggedReason?: string;
}

interface OrderLog {
  id: string;
  status: string;
  type: string;
  date: { toDate?: () => Date; seconds?: number } | number | string | null;
  isLog: boolean;
}

type TimelineItem = 
  | (Message & { timestamp: number; isLog: false })
  | (OrderLog & { timestamp: number; isLog: true });

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  otherPartyName: string;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({ isOpen, onClose, orderId, otherPartyName }) => {
  const { currentUser } = useAuth();
  const { t, i18n } = useI18nTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState(otherPartyName || "Boutique Olmart");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const isRtl = i18n.language === "ar";

  // 1. Fetch connected seller shop name dynamically from order's publicProfile profile
  useEffect(() => {
    if (!isOpen || !orderId || !currentUser) return;

    // Mark messages as read securely
    const markAsRead = async () => {
       try {
          const token = await currentUser.getIdToken();
          await fetch("/api/v1/messages/mark-read", {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
             },
             body: JSON.stringify({ orderId })
          });
       } catch (err: unknown) {
          console.error("Error marking messages as read in drawer:", err);
       }
    };
    markAsRead();

    const orderDocRef = doc(db, "orders", orderId);
    const unsubOrder = onSnapshot(orderDocRef, async (orderSnap) => {
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        const sid = orderData.sellerId || (orderData.sellerIds && orderData.sellerIds[0]);
        if (sid) {
          const shopSnap = await getDoc(doc(db, "publicProfiles", sid));
          if (shopSnap.exists()) {
            setShopName(shopSnap.data().shopName || "Boutique Olmart");
          }
        }
      }
    });
    return () => unsubOrder();
  }, [isOpen, orderId, currentUser]);

  // 2. Listen to messages
  useEffect(() => {
    if (!isOpen || !orderId || !currentUser) return;

    const messagesRef = collection(db, "orders", orderId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(msgs);
        setLoading(false);

        // Auto-scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      },
      (error) => {
        console.error("Chat error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, orderId, currentUser]);

  // 3. Listen to order logs
  useEffect(() => {
    if (!isOpen || !orderId || !currentUser) return;

    const logsRef = collection(db, "orders", orderId, "order_logs");
    const q = query(logsRef, orderBy("date", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isLog: true,
        })) as OrderLog[];
        setLogs(lgs);
      },
      (err) => {
        console.error("Logs error:", err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, orderId, currentUser]);

  const parseTimestampMs = (val: unknown): number => {
    if (!val) return Date.now();
    if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().getTime();
    }
    if (typeof val === "object" && val !== null && "seconds" in val && typeof (val as { seconds: number }).seconds === "number") {
      return (val as { seconds: number }).seconds * 1000;
    }
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = Date.parse(val);
      return isNaN(parsed) ? Date.now() : parsed;
    }
    return Date.now();
  };

  // Merge messages and logs chronologically
  const timelineItems = React.useMemo<TimelineItem[]>(() => {
    const combined: TimelineItem[] = [
      ...messages.map((m) => ({
        ...m,
        timestamp: parseTimestampMs(m.createdAt),
        isLog: false as const,
      })),
      ...logs.map((l) => ({
        ...l,
        timestamp: parseTimestampMs(l.date),
        isLog: true as const,
      })),
    ];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, logs]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success(t("ID Commande copié !"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
    setError("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("Veuillez sélectionner un fichier image valide."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("L'image est trop volumineuse. Taille maximale : 5 Mo."));
      return;
    }

    try {
      setUploading(true);
      setError("");
      toast.loading(t("Téléchargement de l'image..."), { id: "chat-upload-drawer" });

      const fileRef = ref(storage, `chat_images/${orderId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Send message with the image
      const idToken = await currentUser?.getIdToken();
      const res = await fetch("/api/v1/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId,
          text: "",
          imageUrl: downloadUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send image message");
      }

      toast.success(t("Image envoyée !"), { id: "chat-upload-drawer" });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : t("Erreur lors de l'envoi de l'image.");
      setError(msg);
      toast.error(t("Échec de l'envoi de l'image."), { id: "chat-upload-drawer" });
    } finally {
      setUploading(false);
    }
  };

  const handleReportMessage = async () => {
    if (!reportingMessageId) return;

    try {
      const idToken = await currentUser?.getIdToken();
      const res = await fetch("/api/v1/messages/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId,
          messageId: reportingMessageId,
          reason: reportReason.trim() || t("Signalé par l'utilisateur"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to report message");
      }

      toast.success(t("Le message a été signalé à l'équipe de modération."));
      setReportingMessageId(null);
      setReportReason("");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : t("Erreur lors du signalement du message.");
      toast.error(msg);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newMessage.trim() || !currentUser || !orderId) return;

    // 1. Sanitize text
    const text = newMessage.trim();
    const sanitizedText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();

    if (!sanitizedText) {
      setError(t("Le message ne doit pas être vide."));
      return;
    }

    if (sanitizedText.length > 1000) {
      setError(t("Le message est trop long. Maximum 1000 caractères."));
      return;
    }

    // 2. DLP Security check (OLMART Compliance rule)
    if (hasExternalChannel(sanitizedText)) {
      setError(
        t(
          "Sécurité OLMART : Le partage de numéros de téléphone, comptes de réseaux sociaux ou e-mails est strictement interdit. Tout échange doit rester sur OLMART."
        )
      );
      return;
    }

    const compliantText = maskSensitiveData(sanitizedText);

    try {
      setNewMessage(""); // optimistic clear

      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/v1/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          text: compliantText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      const msg = err instanceof Error ? err.message : t("Erreur lors de l'envoi du message.");
      setError(msg);
    }
  };

  // Predefined buyer templates
  const buyerQuickReplies = [
    {
      fr: "Bonjour, est-ce que ma commande est en cours de préparation ?",
      ar: "مرحباً، هل طلبي قيد التحضير حالياً؟",
      en: "Hello, is my order being prepared?",
    },
    {
      fr: "Quand l'expédition est-elle prévue ?",
      ar: "متى من المتوقع شحن الطرد؟",
      en: "When is the shipment scheduled?",
    },
    {
      fr: "Je suis disponible pour recevoir le colis. Merci !",
      ar: "أنا متوفر لاستلام الطرد. شكراً لكم!",
      en: "I am available to receive the package. Thank you!",
    },
    {
      fr: "Merci beaucoup pour votre réactivité et professionnalisme.",
      ar: "شكراً جزيلاً على سرعة استجابتكم واحترافيتكم.",
      en: "Thank you very much for your responsiveness and professionalism.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with CLEAR GLASS style - strict "No blur" rule */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 z-[200]"
          />

          {/* Chat Drawer Side panel */}
          <motion.div
            initial={{ x: isRtl ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`fixed top-0 bottom-0 ${isRtl ? "left-0" : "right-0"} w-full sm:w-[440px] bg-transparent z-[210] shadow-2xl flex flex-col border-s border-stone-250`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-zinc-950 px-6 py-5 flex items-center justify-between shadow-md shrink-0 text-white border-b-2 border-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider leading-none text-white">{shopName}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {t("Mise à jour en temps réel")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleCopyOrderId}
                  className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg text-[9px] font-mono hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  #{orderId.substring(0, 8)}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-zinc-900 rounded-full text-zinc-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline (Messages + Logs) */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col scroll-smooth">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : timelineItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 space-y-3">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner border-2 border-stone-100">
                    <MessageCircle className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-xs font-semibold">{t("no_messages") || "Aucun message ou journal pour l'instant."}</p>
                </div>
              ) : (
                timelineItems.map((item, i) => {
                  if (item.isLog) {
                    return (
                      <div key={item.id || i} className="flex justify-center my-2">
                        <div className="bg-amber-100/60 border border-amber-200/50 text-amber-900 text-[11px] font-medium px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-sm">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>
                            {t(`order_log_status_${item.status}`, item.status)} • {item.type ? t(`order_log_type_${item.type}`, item.type) : ""}
                          </span>
                          <span className="text-[9px] text-amber-700/70 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = item.senderId === currentUser?.uid;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id || i}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2.5 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar bubble */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                          isMe ? "bg-zinc-900 text-white" : "bg-orange-100 text-[var(--color-orange-600, #ea580c)]"
                        }`}>
                          {isMe ? <User className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                        </div>

                        <div className="space-y-1">
                          <div
                            className={`p-3.5 rounded-3xl text-sm leading-relaxed relative group/msg ${
                              isMe 
                                ? "bg-zinc-950 text-white rounded-tr-none shadow-md" 
                                : "bg-white border-2 border-zinc-950 text-zinc-900 rounded-tl-none shadow-md"
                            }`}
                          >
                            {item.text && <p className="font-medium whitespace-pre-wrap text-[13px]">{item.text}</p>}

                            {item.imageUrl && (
                              <div className="mt-2 rounded-2xl overflow-hidden border border-black/10 max-w-[240px]">
                                <img
                                  src={item.imageUrl}
                                  alt="Attached"
                                  className="w-full h-auto cursor-pointer hover:opacity-90 max-h-[180px] object-cover"
                                  referrerPolicy="no-referrer"
                                  onClick={() => window.open(item.imageUrl, "_blank")}
                                />
                              </div>
                            )}

                            {item.flagged && (
                              <div className="mt-1 bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-medium border border-red-150">
                                <AlertCircle className="w-3 h-3" />
                                {t("Message signalé")}
                              </div>
                            )}

                            {/* Report button */}
                            {!isMe && !item.flagged && (
                              <button
                                type="button"
                                onClick={() => setReportingMessageId(item.id)}
                                title={t("Signaler ce message")}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 hover:text-red-500 text-stone-400 rounded transition-all cursor-pointer opacity-0 group-hover/msg:opacity-100 bg-transparent border-none"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          
                          <span className={`text-[9px] font-mono block px-1 ${isMe ? "text-end text-zinc-400" : "text-start text-stone-400"}`}>
                            {new Date(item.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-500 inline ms-1" />}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Quick reply templates carousel */}
            <div className="px-4 py-2 bg-stone-100 border-t border-b border-stone-200 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 text-orange-600 text-[10px] font-sans font-bold uppercase tracking-widest shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("Modèles")} :</span>
              </div>
              <div className="flex gap-2 shrink-0">
                {buyerQuickReplies.map((reply, index) => {
                  const labelText = reply[i18n.language as "fr" | "ar" | "en"] || reply.fr;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickReply(labelText)}
                      className="bg-white hover:bg-zinc-900 hover:text-white border border-stone-300 text-stone-700 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      {labelText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form input area */}
            <div className="p-4 bg-white border-t border-stone-100 shrink-0">
              {error && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-start gap-2 text-xs font-semibold leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                {/* File attachment hidden input and button */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 text-stone-500 hover:text-orange-600 transition-all rounded-full cursor-pointer disabled:opacity-50 shrink-0 border border-zinc-200 flex items-center justify-center bg-transparent"
                >
                  {uploading ? <Loader2 className="w-4.5 h-4.5 animate-spin text-orange-600" /> : <Paperclip className="w-4.5 h-4.5" />}
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setError("");
                    }}
                    maxLength={1000}
                    placeholder={t("type_message") || "Votre message sécurisé..."}
                    className="w-full bg-transparent border-2 border-zinc-950 rounded-[2rem] ps-6 pe-14 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-zinc-900 placeholder:text-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-orange-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-orange-500 transition-all active:scale-95 shadow-md shadow-orange-600/10 cursor-pointer border-none"
                  >
                    <Send className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Flag Report Modal overlay */}
          {reportingMessageId && (
            <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-stone-200 shadow-2xl relative animate-in zoom-in-95 duration-150 text-start">
                <h4 className="font-sans font-bold text-sm text-zinc-900 mb-2 uppercase tracking-wide">
                  {t("Signaler ce message")}
                </h4>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  {t("Veuillez indiquer la raison du signalement. Le message sera examiné par nos modérateurs sous 24 heures.")}
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t("Ex: Contenu agressif, partage de contact externe, spam...")}
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 mb-4 h-24 font-sans font-medium"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setReportingMessageId(null);
                      setReportReason("");
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer border-none"
                  >
                    {t("Annuler")}
                  </button>
                  <button
                    type="button"
                    onClick={handleReportMessage}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer border-none"
                  >
                    {t("Confirmer")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
