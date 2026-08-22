import React from 'react';
import { Send, Paperclip, DollarSign, Loader2 } from 'lucide-react';

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
}

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
  fileInputRef
}) => {
  if (isBlocked) {
    return (
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="p-2 text-center text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl">
          Cette conversation est bloquée.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
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
          className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50 cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
          title="Joindre une photo ou un document PDF (max 5 Mo)"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        {!hasActiveNegotiation && (
          <button
            type="button"
            onClick={onToggleNegotiate}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[38px]"
            title="Faire une offre de prix"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Négocier</span>
          </button>
        )}

        <input
          type="text"
          value={textInput}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Votre message..."
          disabled={isSending}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition min-h-[38px]"
        />

        <button
          type="submit"
          disabled={isSending || !textInput.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center cursor-pointer min-w-[38px] min-h-[38px]"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
