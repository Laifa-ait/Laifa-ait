import React, { useEffect, useState, useRef } from "react";
import { auth, storage } from "../lib/firebase";
import { apiGet, apiPost } from "../lib/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  AlertTriangle, 
  CheckCheck, 
  ShieldCheck, 
  Clock, 
  Store, 
  User, 
  Info, 
  Copy, 
  Check, 
  MessageSquare,
  Sparkles,
  Paperclip,
  Flag,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { maskSensitiveData, hasExternalChannel } from "../utils/masking";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  senderId: string;
  senderRole?: "buyer" | "seller" | "admin";
  text: string;
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

type TimelineMessage = Message & {
  timestamp: number;
  isLog: false;
};

type TimelineLog = OrderLog & {
  timestamp: number;
  isLog: true;
};

type TimelineItem = TimelineMessage | TimelineLog;

export const OrderChatBox: React.FC<{ orderId: string; buyerId: string }> = ({ orderId, buyerId }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const isRtl = i18n.language === "ar";
  const isBuyer = currentUser?.uid === buyerId;

  // Poll for chat updates
  useEffect(() => {
    if (!orderId) return;
    let isCancelled = false;
    
    const fetchChat = async () => {
      try {
        const data = await apiGet<{ buyerName?: string; shopName?: string; messages?: Message[]; logs?: OrderLog[] }>(`/api/v1/orders/${orderId}/chat`);
        if (isCancelled) return;
        setBuyerName(data.buyerName || t("Acheteur Olmart"));
        setShopName(data.shopName || t("Boutique Olmart"));
        
        setMessages((prev) => {
          if ((data.messages?.length || 0) > prev.length) {
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }, 100);
          }
          return data.messages || [];
        });
        setLogs(data.logs || []);
      } catch (err) {
        if (!isCancelled) console.error("Error fetching chat:", err);
      }
    };
    
    fetchChat();
    const interval = setInterval(fetchChat, 10000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [orderId, t]);

  // Merge messages and logs in chronological order for a unified timeline
  const timelineItems = React.useMemo<TimelineItem[]>(() => {
    const combinedMessages: TimelineMessage[] = messages.map((m) => ({
      ...m,
      timestamp: typeof m.createdAt === "object" && m.createdAt && "toDate" in m.createdAt && typeof m.createdAt.toDate === "function" ? m.createdAt.toDate().getTime() : typeof m.createdAt === "object" && m.createdAt && "seconds" in m.createdAt && typeof m.createdAt.seconds === "number" ? m.createdAt.seconds * 1000 : typeof m.createdAt === "number" ? m.createdAt : Date.now(),
      isLog: false,
    }));
    const combinedLogs: TimelineLog[] = logs.map((l) => ({
      ...l,
      timestamp: typeof l.date === "object" && l.date && "toDate" in l.date && typeof l.date.toDate === "function" ? l.date.toDate().getTime() : typeof l.date === "object" && l.date && "seconds" in l.date && typeof l.date.seconds === "number" ? l.date.seconds * 1000 : typeof l.date === "number" ? l.date : Date.now(),
      isLog: true,
    }));
    const combined: TimelineItem[] = [...combinedMessages, ...combinedLogs];
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
      toast.loading(t("Téléchargement de l'image..."), { id: "chat-upload" });

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

      toast.success(t("Image envoyée !"), { id: "chat-upload" });
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || t("Erreur lors de l'envoi de l'image."));
      toast.error(t("Échec de l'envoi de l'image."), { id: "chat-upload" });
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
      const errMsg = err instanceof Error ? err.message : "";
      toast.error(errMsg || t("Erreur lors du signalement du message."));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser || !newMessage.trim()) return;

    // 1. Sanitize text
    const rawText = newMessage.trim();
    const sanitizedText = rawText.replace(/<\/?[^>]+(>|$)/g, "").trim();

    if (!sanitizedText) {
      setError(t("Le message ne doit pas être vide ou contenir que du code HTML."));
      return;
    }

    if (sanitizedText.length > 1000) {
      setError(t("Le message est trop long. Maximum 1000 caractères."));
      return;
    }

    // 2. Strict DLP: Prevent external communication channels
    if (hasExternalChannel(sanitizedText)) {
      setError(
        t(
          "Sécurité OLMART : Le partage de coordonnées (téléphone, e-mail, réseaux sociaux) est interdit pour votre protection."
        )
      );
      return;
    }

    const compliantText = maskSensitiveData(sanitizedText);

    try {
      setNewMessage("");

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
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || t("Erreur lors de l'envoi du message."));
    }
  };

  // Predefined seller templates translated
  const sellerQuickReplies = [
    {
      fr: "Votre commande est en cours de préparation et sera expédiée très bientôt.",
      ar: "طلبكم قيد التحضير وسيتم شحنه في أقرب وقت ممكن.",
      en: "Your order is being prepared and will be shipped very soon.",
    },
    {
      fr: "Pouvez-vous confirmer votre adresse et commune de livraison s'il vous plaît ?",
      ar: "هل يمكنك تأكيد عنوانك وبلدية التوصيل من فضلك؟",
      en: "Can you confirm your address and delivery commune please?",
    },
    {
      fr: "Le colis a été remis au transporteur aujourd'hui. Suivi disponible.",
      ar: "تم تسليم الطرد لشركة الشحن اليوم. التتبع متوفر.",
      en: "The package was handed over to the carrier today. Tracking available.",
    },
    {
      fr: "Merci pour votre confiance ! N'hésitez pas à évaluer notre boutique.",
      ar: "شكراً لثقتكم بنا! لا تترددوا في تقييم متجرنا.",
      en: "Thank you for your trust! Feel free to rate our shop.",
    },
  ];

  const buyerQuickReplies = [
    {
      fr: "Bonjour, quand est-ce que ma commande sera expédiée ?",
      ar: "مرحباً، متى سيتم شحن طلبي؟",
      en: "Hello, when will my order be shipped?",
    },
    {
      fr: "Pouvez-vous me donner plus de détails sur la livraison ?",
      ar: "هل يمكنك إعطائي مزيد من التفاصيل حول التوصيل؟",
      en: "Can you give me more details about the delivery?",
    },
    {
      fr: "J'ai bien reçu ma commande, merci beaucoup !",
      ar: "لقد استلمت طلبي، شكراً جزيلاً لكم!",
      en: "I have successfully received my order, thank you very much!",
    }
  ];

  const quickReplies = isBuyer ? buyerQuickReplies : sellerQuickReplies;

  return (
    <div className="flex flex-col h-[460px] sm:h-[520px] max-h-[75vh] w-full max-w-full min-w-0 bg-transparent/60 rounded-[1.25rem] sm:rounded-[2.5rem] border-2 border-zinc-950 overflow-hidden shadow-xl relative" id="order-chat-box">
      {/* Premium Connection & Status Bar */}
      <div className="bg-zinc-950 p-2.5 sm:p-5 shrink-0 flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 border-b-2 border-zinc-950">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-zinc-950 shrink-0">
            {isBuyer ? <Store className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5" /> : <User className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5" />}
          </div>
          <div className="text-start min-w-0 flex-1">
            <h4 className="text-white font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider leading-none truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[200px] md:max-w-none">
              {isBuyer ? shopName : buyerName}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[8px] sm:text-[10px] text-zinc-400 font-mono truncate">
                {t("Mise à jour en temps réel")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end xs:self-auto">
          <button 
            type="button" 
            onClick={handleCopyOrderId}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-[8px] sm:text-[9px] font-mono hover:text-white hover:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            <span>#{orderId.substring(0, 6)}</span>
          </button>
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal shrink-0">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">{t("Sécurisé")}</span>
          </div>
        </div>
      </div>

      {/* Unified Timeline Area with framer motion animations */}
      <div ref={scrollRef} className="flex-1 p-2.5 sm:p-6 overflow-y-auto space-y-2.5 sm:space-y-4 flex flex-col scroll-smooth">
        <AnimatePresence initial={false}>
          {timelineItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-100 flex items-center justify-center border-2 border-zinc-200">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300" />
              </div>
              <p className="text-xs text-center font-semibold px-4">
                {t("Aucun message ni journal d'activité pour le moment.")}
              </p>
            </div>
          ) : (
            timelineItems.map((item, i) => {
              if (item.isLog) {
                // Activity log layout
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id || i} 
                    className="flex justify-center my-1 px-1"
                  >
                    <div className="bg-amber-100/60 border border-amber-200/50 text-amber-900 text-[9px] sm:text-[11px] font-medium px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-2xl flex items-center justify-center gap-1 sm:gap-2 shadow-sm max-w-full text-center">
                      <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 shrink-0" />
                      <span className="line-clamp-2 sm:line-clamp-none">
                        {t(`order_log_status_${item.status}`, item.status)} • {item.type ? t(`order_log_type_${item.type}`, item.type) : ""}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-amber-700/70 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              const isMe = item.senderId === currentUser?.uid;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id || i} 
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-1.5 sm:gap-2.5 max-w-[88%] xs:max-w-[85%] sm:max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 shadow-sm border ${
                       isMe ? "bg-zinc-950 text-white border-zinc-900" : "bg-orange-100 text-[var(--color-orange-600, #ea580c)] border-orange-200"
                    }`}>
                      {item.senderId === buyerId ? <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div
                        className={`p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed relative group/msg ${
                          isMe 
                            ? "bg-zinc-950 text-white rounded-tr-none shadow-md shadow-zinc-950/10" 
                            : "bg-white border-2 border-zinc-950 text-zinc-900 rounded-tl-none shadow-md"
                        }`}
                      >
                        {item.text && <p className="font-medium whitespace-pre-wrap break-words">{item.text}</p>}
                        
                        {item.imageUrl && (
                          <div className="mt-2 rounded-xl sm:rounded-2xl overflow-hidden border border-black/10 max-w-[170px] xs:max-w-[200px] sm:max-w-[240px]">
                            <img
                              src={item.imageUrl}
                              alt="Attached"
                              className="w-full h-auto cursor-pointer hover:opacity-90 max-h-[130px] sm:max-h-[180px] object-cover"
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
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 hover:text-red-500 text-stone-400 rounded transition-all cursor-pointer opacity-0 group-hover/msg:opacity-100 bg-transparent border-none hidden sm:block"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <span className={`text-[9px] font-mono block px-1 ${isMe ? "text-end text-zinc-400" : "text-start text-stone-400"} flex items-center justify-start ${isMe ? "justify-end" : "justify-start"} gap-1.5`}>
                        <span>{new Date(item.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-500 inline font-bold" />}
                        {!isMe && !item.flagged && (
                          <button
                            type="button"
                            onClick={() => setReportingMessageId(item.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent p-0 sm:hidden flex items-center gap-0.5"
                          >
                            • <Flag className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Predefined Quick Replies (Carousel with scrolling) */}
      <div className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-stone-100 border-t border-b border-stone-250 shrink-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none w-full max-w-full min-w-0 touch-pan-x">
        <div className="flex items-center gap-1 text-orange-600 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-widest shrink-0">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">{t("Modèles")} :</span>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          {quickReplies.map((reply, index) => {
            const labelText = reply[i18n.language as "fr" | "ar" | "en"] || reply.fr;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickReply(labelText)}
                className="bg-white hover:bg-zinc-900 hover:text-white border border-stone-300 text-stone-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-medium whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form Area */}
      <div className="p-2 sm:p-3.5 bg-white shrink-0 border-t border-stone-150">
        {error && (
          <div className="mb-2 p-2 sm:p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-start gap-2 text-[10px] sm:text-xs font-medium leading-normal">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSend} className="relative flex items-center gap-1.5 sm:gap-2 w-full">
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
            className="w-8 h-8 sm:w-10 sm:h-10 text-stone-500 hover:text-orange-600 transition-all rounded-full cursor-pointer disabled:opacity-50 shrink-0 border border-zinc-200 flex items-center justify-center bg-transparent"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 animate-spin text-orange-600" /> : <Paperclip className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />}
          </button>

          <div className="relative flex-1 flex items-center min-w-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setError("");
              }}
              maxLength={1000}
              placeholder={isRtl ? "اكتب رسالة..." : "Écrire un message..."}
              className="w-full bg-transparent border-2 border-zinc-950 rounded-[2rem] ps-3.5 sm:ps-6 pe-9 sm:pe-12 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-zinc-900 placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute end-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 bg-orange-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-orange-500 transition-all active:scale-95 shadow-md hover:shadow-orange-600/20 cursor-pointer border-none shrink-0"
            >
              <Send className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRtl ? "rotate-180" : ""}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Flag Report Modal overlay */}
      {reportingMessageId && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
    </div>
  );
};
