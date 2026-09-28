import React from 'react';
import { Send, Paperclip, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LiveChatInputProps {
  messageText: string;
  onChangeText: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  error: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectQuickReply: (text: string) => void;
}

const BUYER_QUICK_REPLIES = [
  { fr: "Bonjour, ma commande est-elle en cours de préparation ?", ar: "مرحباً، هل طلبي قيد التحضير حالياً؟" },
  { fr: "Quand l'expédition est-elle prévue ?", ar: "متى من المتوقع شحن الطرد؟" },
  { fr: "Je suis disponible pour la réception. Merci !", ar: "أنا متوفر لاستلام الطرد. شكراً لكم!" },
  { fr: "Merci pour votre réactivité !", ar: "شكراً جزيلاً على سرعة استجابتكم!" },
];

export const LiveChatInput: React.FC<LiveChatInputProps> = ({
  messageText,
  onChangeText,
  onSendMessage,
  onSelectFile,
  uploading,
  error,
  fileInputRef,
  onSelectQuickReply,
}) => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'fr') as 'fr' | 'ar';

  return (
    <div className="bg-white border-t border-stone-200/80 p-3 space-y-2.5 shrink-0">
      {/* Quick reply suggestions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 shrink-0">
          <Sparkles className="w-3 h-3" />
          <span>{t("Suggestions :")}</span>
        </div>
        {BUYER_QUICK_REPLIES.map((reply, idx) => {
          const text = lang === 'ar' ? reply.ar : reply.fr;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuickReply(text)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-orange-50 hover:text-orange-700 text-stone-700 text-[11px] font-medium border border-stone-200/60 transition-colors cursor-pointer"
            >
              {text}
            </button>
          );
        })}
      </div>

      {/* Security alert if DLP triggers */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={onSendMessage} className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onSelectFile}
          className="hidden"
          disabled={uploading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer shrink-0 border border-stone-200/70"
          title="Joindre une photo"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-orange-600" /> : <Paperclip className="w-4 h-4" />}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={messageText}
            onChange={(e) => onChangeText(e.target.value)}
            maxLength={1000}
            placeholder={t("Écrivez votre message sécurisé...") || "Votre message..."}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <button
          type="submit"
          disabled={!messageText.trim()}
          className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
};
