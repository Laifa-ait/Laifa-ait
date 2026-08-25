import React from 'react';
import { Send, Paperclip, DollarSign, Loader2, Calendar } from 'lucide-react';

interface ChatInputBarProps {
  textInput: string;
  onChangeText: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleNegotiate: () => void;
  isBlocked: boolean;
  isSending: boolean;
  isUploading: boolean;
  hasActiveNegotiation: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isRealEstate?: boolean;
  onSelectQuickChip?: (text: string) => void;
  onRequestVisit?: () => void;
}

const REAL_ESTATE_QUICK_CHIPS = [
  "Ce bien m'intéresse",
  "Est-il toujours disponible ?",
  "Peut-on organiser une visite ?",
  "Le prix est-il négociable ?",
];

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  textInput,
  onChangeText,
  onSubmit,
  onSelectFile,
  onToggleNegotiate,
  isBlocked,
  isSending,
  isUploading,
  hasActiveNegotiation,
  fileInputRef,
  isRealEstate = false,
  onSelectQuickChip,
  onRequestVisit
}) => {
  if (isBlocked) {
    return (
      <div className="p-3 border-t border-[#e8e2d4] bg-white">
        <div className="p-2 text-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          Cette conversation est bloquée.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-[#e8e2d4] bg-white space-y-2">
      {/* Real Estate Quick Action Chips */}
      {isRealEstate && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {onRequestVisit && (
            <button
              type="button"
              onClick={onRequestVisit}
              className="shrink-0 px-3 py-1 rounded-full bg-[#1e3835] hover:bg-[#152725] text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Calendar className="w-3 h-3 text-[#ebdcb8]" />
              <span>Visite</span>
            </button>
          )}

          {REAL_ESTATE_QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuickChip ? onSelectQuickChip(chip) : onChangeText(chip)}
              className="shrink-0 px-3 py-1 rounded-full bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1e3835] border border-[#e8e2d4] text-[11px] font-medium transition cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Primary Input Form */}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onSelectFile}
          accept="image/*,application/pdf"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl hover:bg-[#f4ecd8] text-slate-500 hover:text-[#1e3835] transition disabled:opacity-50 cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center border border-[#e8e2d4]"
          title="Joindre une photo ou un document PDF (max 5 Mo)"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#1e3835]" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        {!hasActiveNegotiation && (
          <button
            type="button"
            onClick={onToggleNegotiate}
            className="p-2 rounded-xl bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1e3835] border border-[#e8e2d4] transition text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[38px]"
            title="Faire une offre de prix"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#7a824e]" />
            <span className="hidden sm:inline">Négocier</span>
          </button>
        )}

        <input
          type="text"
          value={textInput}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={isRealEstate ? "Votre message concernant ce bien..." : "Votre message..."}
          disabled={isSending}
          className="flex-1 bg-[#faf8f5] border border-[#e8e2d4] rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#1e3835] transition min-h-[38px]"
        />

        <button
          type="submit"
          disabled={isSending || !textInput.trim()}
          className="p-2.5 bg-[#1e3835] hover:bg-[#152725] disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center cursor-pointer min-w-[38px] min-h-[38px] shadow-xs"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#ebdcb8]" />
          ) : (
            <Send className="w-4 h-4 text-[#ebdcb8]" />
          )}
        </button>
      </form>
    </div>
  );
};

