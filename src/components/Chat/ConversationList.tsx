import React from 'react';
import {
  MessageSquare,
  Building2,
  ShoppingBag,
  Wrench,
  Archive,
  Ban
} from 'lucide-react';
import { ConversationDocument, ConversationType } from '../../types/messaging';

interface ConversationListProps {
  conversations: ConversationDocument[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (conversation: ConversationDocument) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const getContextIcon = (type: ConversationType) => {
  switch (type) {
    case 'REAL_ESTATE_INQUIRY':
      return <Building2 className="w-4 h-4 text-emerald-400" />;
    case 'ORDER_SUPPORT':
      return <ShoppingBag className="w-4 h-4 text-blue-400" />;
    case 'BRICOLAGE_QUOTE':
      return <Wrench className="w-4 h-4 text-amber-400" />;
    default:
      return <MessageSquare className="w-4 h-4 text-purple-400" />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} j`;
    return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
  isLoading,
  hasMore,
  onLoadMore
}) => {
  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Aucune conversation active</p>
        <p className="text-xs text-slate-500 max-w-[200px]">
          Vos échanges avec les vendeurs, propriétaires ou artisans s'afficheront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-800/80 overflow-y-auto">
      {conversations.map((conv) => {
        const isSelected = selectedId === conv.id;
        const otherParticipantUid = conv.participants.find((uid) => uid !== currentUserId) || conv.participants[0];
        const otherParticipant = conv.participantDetails[otherParticipantUid] || {
          displayName: 'Interlocuteur',
          role: 'user'
        };
        const myDetails = conv.participantDetails[currentUserId];
        const unreadCount = myDetails?.unreadCount || 0;

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
              isSelected
                ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                : 'hover:bg-slate-800/40'
            }`}
          >
            {/* Avatar or Context Icon */}
            <div className="relative shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                {conv.context.referenceImageUrl ? (
                  <img
                    src={conv.context.referenceImageUrl}
                    alt={conv.context.referenceTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getContextIcon(conv.type)
                )}
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold min-w-[18px] text-center shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>

            {/* Conversation Summary */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4 className="text-xs font-bold text-slate-200 truncate">
                  {otherParticipant.displayName}
                </h4>
                {conv.updatedAt && (
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatTimeAgo(conv.updatedAt)}
                  </span>
                )}
              </div>

              {/* Reference Title */}
              <div className="text-[11px] text-emerald-400/90 font-medium truncate mb-1">
                {conv.context.referenceTitle || 'Échange Olmart'}
              </div>

              {/* Last Message or Status */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-400 truncate">
                  {conv.activeNegotiation?.status === 'PENDING' ? (
                    <span className="text-amber-400 font-medium">Offre en cours ({conv.activeNegotiation.amountDZD.toLocaleString()} DZD)</span>
                  ) : conv.lastMessage ? (
                    conv.lastMessage.text
                  ) : (
                    'Nouvelle conversation'
                  )}
                </p>

                {/* Flags */}
                {conv.isBlocked && (
                  <Ban className="w-3 h-3 text-red-400 shrink-0" />
                )}
                {conv.isArchived && (
                  <Archive className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </div>
            </div>
          </button>
        );
      })}

      {hasMore && (
        <div className="p-3 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
          >
            {isLoading ? 'Chargement...' : 'Charger les conversations précédentes'}
          </button>
        </div>
      )}
    </div>
  );
};
