import React from 'react';
import { X, ArrowLeft, ShieldCheck, Ban } from 'lucide-react';
import { ConversationDocument } from '../../types/messaging';

interface UnifiedMessagingHeaderProps {
  selectedConversation: ConversationDocument | null;
  onBack: () => void;
  onBlock: () => void;
  onClose: () => void;
}

export const UnifiedMessagingHeader: React.FC<UnifiedMessagingHeaderProps> = ({
  selectedConversation,
  onBack,
  onBlock,
  onClose
}) => {
  return (
    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {selectedConversation && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <span>{selectedConversation ? selectedConversation.context.referenceTitle || 'Discussion' : 'Messagerie'}</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {selectedConversation && (
          <button
            type="button"
            onClick={onBlock}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 cursor-pointer"
            title="Bloquer cette conversation"
          >
            <Ban className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
