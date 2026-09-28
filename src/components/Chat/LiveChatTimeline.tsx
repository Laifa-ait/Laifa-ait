import React from 'react';
import { 
  User, 
  Store, 
  Check,
  CheckCheck, 
  AlertCircle, 
  Flag, 
  MessageSquare, 
  Info,
  Loader2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  recipientId?: string;
  imageUrl?: string;
  read?: boolean;
  readAt?: { toDate?: () => Date; seconds?: number } | number | string | null;
  createdAt: { toDate?: () => Date; seconds?: number } | number | string | null;
  isLog?: boolean;
  flagged?: boolean;
}

export interface ChatOrderLog {
  id: string;
  status: string;
  type: string;
  date: { toDate?: () => Date; seconds?: number } | number | string | null;
  isLog: boolean;
}

export type TimelineItem = 
  | (ChatMessage & { timestamp: number; isLog: false })
  | (ChatOrderLog & { timestamp: number; isLog: true });

interface LiveChatTimelineProps {
  timelineItems: TimelineItem[];
  loading: boolean;
  currentUserId?: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onReportMessage?: (messageId: string) => void;
}

export const LiveChatTimeline: React.FC<LiveChatTimelineProps> = ({
  timelineItems,
  loading,
  currentUserId,
  scrollRef,
  onReportMessage,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
        <p className="text-xs font-medium text-stone-500">{t("Chargement des échanges...")}</p>
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xs mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
          {t("Messagerie Sécurisée")}
        </h4>
        <p className="text-xs text-stone-500 leading-relaxed">
          {t("Posez vos questions au vendeur ou demandez des précisions sur votre commande.")}
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
      {timelineItems.map((item, index) => {
        if (item.isLog) {
          return (
            <div key={item.id || index} className="flex justify-center my-2">
              <div className="bg-amber-50/80 border border-amber-200/60 text-amber-900 text-[11px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  {t(`order_log_status_${item.status}`, item.status)} {item.type ? `• ${t(`order_log_type_${item.type}`, item.type)}` : ''}
                </span>
                <span className="text-[10px] text-amber-700/70 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        }

        const isMe = item.senderId === currentUserId;
        const timeStr = new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const isRead = Boolean(item.read);

        return (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[82%] sm:max-w-[78%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Mini avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                  isMe ? 'bg-stone-900 text-white' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {isMe ? <User className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
              </div>

              {/* Message bubble */}
              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed relative group ${
                    isMe
                      ? 'bg-orange-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-stone-200/80 text-stone-900 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {item.text && <p className="whitespace-pre-wrap font-medium">{item.text}</p>}

                  {item.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-black/10 max-w-[220px]">
                      <img
                        src={item.imageUrl}
                        alt="Photo envoyée"
                        loading="lazy"
                        className="w-full h-auto max-h-[160px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        referrerPolicy="no-referrer"
                        onClick={() => window.open(item.imageUrl, '_blank')}
                      />
                    </div>
                  )}

                  {item.flagged && (
                    <div className="mt-1 bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t("Message signalé")}</span>
                    </div>
                  )}

                  {!isMe && !item.flagged && onReportMessage && (
                    <button
                      type="button"
                      onClick={() => onReportMessage(item.id)}
                      title={t("Signaler")}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status & time indicator */}
                <div className={`flex items-center gap-1.5 text-[10px] text-stone-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span>{timeStr}</span>

                  {isMe && (
                    isRead ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold" title={t("Message lu par le destinataire") || "Message lu"}>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t("Lu") || "Lu"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-stone-400 font-medium" title={t("Message envoyé") || "Envoyé"}>
                        <Check className="w-3.5 h-3.5 text-stone-400" />
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
