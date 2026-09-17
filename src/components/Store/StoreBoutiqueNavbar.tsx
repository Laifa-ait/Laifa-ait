import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingBag, ShieldCheck, Check, MapPin } from 'lucide-react';
import { useOptionalCart } from '../../context/CartContext';
import { useOptionalUI } from '../../context/UIContext';
import { toast } from 'react-hot-toast';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface StoreBoutiqueNavbarProps {
  storeInfo: PublicStoreInfo;
}

export const StoreBoutiqueNavbar: React.FC<StoreBoutiqueNavbarProps> = ({ storeInfo }) => {
  const navigate = useNavigate();
  const cartContext = useOptionalCart();
  const uiContext = useOptionalUI();
  const [copied, setCopied] = useState(false);

  const shopName = storeInfo.shopName || storeInfo.displayName || storeInfo.brand || 'Boutique Olmart';
  const logoUrl = storeInfo.logoUrl || storeInfo.avatarUrl || storeInfo.photoURL || storeInfo.photoUrl || storeInfo.avatar;
  const itemCount = cartContext?.cart ? cartContext.cart.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/shop');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: `Découvrez la boutique officielle ${shopName} sur Olmart`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if share canceled or not supported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien de la boutique copié !');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.success('Lien disponible');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Back button + Boutique mini branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-xs font-bold shrink-0 cursor-pointer"
            aria-label="Retour au catalogue"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          {/* Boutique Mini Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-orange-50 border border-slate-200 shrink-0 flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={getOptimizedImageUrl(logoUrl, 60)}
                  alt={shopName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-orange-600 font-black text-xs">
                  {shopName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {shopName}
                </h2>
                <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Vérifié
                </span>
              </div>
              {storeInfo.wilaya && (
                <p className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-500 font-medium truncate">
                  <MapPin className="w-2.5 h-2.5 text-orange-500" />
                  {storeInfo.wilaya}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Share + Cart */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            title="Partager cette boutique"
            aria-label="Partager cette boutique"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700 font-bold">Copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => uiContext?.setIsCartOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 hover:bg-black text-white transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
            title="Ouvrir le panier"
            aria-label="Panier d'achat"
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
