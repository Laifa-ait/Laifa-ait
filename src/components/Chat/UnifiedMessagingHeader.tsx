import React from 'react';
import { X, ArrowLeft, ShieldCheck, Ban, Building2, ExternalLink, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const isRealEstate =
    selectedConversation?.type === 'REAL_ESTATE_INQUIRY' ||
    Boolean(selectedConversation?.context?.propertyId);

  const propertyId = selectedConversation?.context?.propertyId;
  const propertyTitle = selectedConversation?.context?.referenceTitle || 'Annonce immobilière';
  const propertyImage = selectedConversation?.context?.referenceImage || selectedConversation?.context?.referenceImageUrl;
  const propertyPrice = selectedConversation?.context?.referencePriceDZD;

  const handleNavigateToProperty = () => {
    if (propertyId) {
      onClose();
      navigate(`/immo/property/${propertyId}`);
    }
  };

  return (
    <div className="border-b border-[#e8e2d4] bg-white">
      {/* Primary Header Row */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedConversation && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-2xl hover:bg-[#f4ecd8] text-zinc-600 hover:text-[#1e3835] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h3 className="text-sm font-bold text-[#1e3835] flex items-center gap-1.5 font-['Playfair_Display',serif]">
              <span>{selectedConversation ? propertyTitle : 'Messagerie Olma'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            {isRealEstate && (
              <span className="text-[11px] text-[#7a824e] flex items-center gap-1 font-bold">
                <Building2 className="w-3 h-3" /> Immobilier Olma
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {selectedConversation && (
            <button
              type="button"
              onClick={onBlock}
              className="p-2 rounded-2xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Bloquer cette conversation"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-[#f4ecd8] text-zinc-500 hover:text-[#1e3835] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Real Estate Context Banner */}
      {selectedConversation && isRealEstate && propertyId && (
        <div className="px-4 pb-3">
          <div className="bg-[#f9f7f2] border border-[#e8e2d4] rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {propertyImage ? (
                <img loading="lazy" decoding="async" src={propertyImage}
                  alt={propertyTitle}
                  className="w-11 h-11 rounded-2xl object-cover border border-[#e8e2d4] shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-[#f4ecd8] flex items-center justify-center shrink-0 border border-[#e8e2d4] text-[#1e3835]">
                  <Building2 className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1e3835] truncate">
                  {propertyTitle}
                </p>
                {propertyPrice ? (
                  <p className="text-[11px] font-black text-[#1e3835] flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3 text-[#7a824e]" />
                    {propertyPrice.toLocaleString('fr-DZ')} DZD
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-500 font-mono">Réf: {propertyId}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNavigateToProperty}
              className="px-3 py-1.5 bg-[#1e3835] hover:bg-[#152725] text-white rounded-2xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Fiche</span>
              <ExternalLink className="w-3 h-3 text-[#ebdcb8]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

