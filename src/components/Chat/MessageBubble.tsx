import React from 'react';
import {
  FileText,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { ChatMessageDocument } from '../../types/messaging';

interface MessageBubbleProps {
  msg: ChatMessageDocument;
  isMe: boolean;
  onReport: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isMe, onReport }) => {
  if (msg.isSystem) {
    return (
      <div className="text-center my-2">
        <span className="inline-block px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-medium border border-slate-700/50">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
      <div
        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs relative ${
          isMe
            ? 'bg-emerald-600 text-white rounded-br-xs'
            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>

        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {msg.attachments.map((att, idx) => (
              <div key={idx}>
                {att.type === 'image' ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-white/20 hover:opacity-90 transition cursor-pointer"
                  >
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="max-h-48 w-auto object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-black/20 rounded-xl hover:bg-black/30 transition text-xs font-semibold text-white cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span className="truncate">{att.fileName}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {msg.violation && (
          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-300 font-medium">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Coordonnées masquées par sécurité</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500">
        <span>
          {new Date(msg.createdAt).toLocaleTimeString('fr-DZ', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {!isMe && (
          <button
            type="button"
            onClick={() => onReport(msg.id)}
            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition cursor-pointer"
            title="Signaler ce message"
          >
            <Flag className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
