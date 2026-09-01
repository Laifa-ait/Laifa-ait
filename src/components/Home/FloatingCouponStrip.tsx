import React, { useState, useEffect } from "react";
import { Gift, X, Sparkles, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const FloatingCouponStrip: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const lang = i18n.language || "fr";
  const isArabic = lang.startsWith("ar");

  useEffect(() => {
    const claimed = localStorage.getItem("olma_coupon_500_claimed");
    if (claimed) {
      setIsClaimed(true);
    }
  }, []);

  const handleClaim = () => {
    localStorage.setItem("olma_coupon_500_claimed", "true");
    setIsClaimed(true);
    setShowModal(true);
  };

  if (isDismissed) return null;

  return (
    <>
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 my-2 sm:my-3">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center justify-between text-white border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Subtle Background Glow/Pattern */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          {/* Left: Icon & Text */}
          <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-amber-200">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-black uppercase bg-amber-400 text-red-900 px-1.5 py-0.2 rounded-md tracking-wider shrink-0">
                  {isArabic ? "هدية خاصة" : "OFFRE BIENVENUE"}
                </span>
                <p className="text-xs sm:text-sm font-bold truncate">
                  {isArabic
                    ? "قسيمة شراء بقيمة 500 دج مهداة لطلبك الأول!"
                    : "Bon de réduction de 500 DA offert pour votre commande !"}
                </p>
              </div>
              <span className="text-[10px] sm:text-[11px] text-white/90 truncate hidden sm:block">
                {isArabic ? "استعمل الرمز OLMA500 عند إتمام الطلب" : "Utilisable sur tout le catalogue Olmart sans minimum"}
              </span>
            </div>
          </div>

          {/* Right: Claim Action & Close */}
          <div className="flex items-center gap-2 z-10 shrink-0 ps-2">
            <button
              onClick={handleClaim}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-black transition-all transform active:scale-95 shadow-sm border-none cursor-pointer flex items-center gap-1 ${
                isClaimed
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-white text-orange-600 hover:bg-amber-50 hover:shadow-md"
              }`}
            >
              {isClaimed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isArabic ? "تم الحصول عليه" : "Activé"}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{isArabic ? "استلام القسيمة" : "Récupérer"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors bg-transparent border-none cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Claim Voucher Celebration Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top red header illustration */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg mb-4">
              <Gift className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {isArabic ? "🎉 مبروك! حصلت على 500 دج" : "🎉 Félicitations !"}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {isArabic
                ? "تم تفعيل رمز الخصم OLMA500 لحسابك بنجاح."
                : "Votre coupon de 500 DA a été activé avec le code promo :"}
            </p>

            <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-2xl py-3 px-4 mb-5 flex items-center justify-between">
              <span className="text-lg font-black font-mono text-orange-600 tracking-widest">
                OLMA500
              </span>
              <span className="text-xs font-bold text-slate-500">
                -500 DA
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/shop");
                }}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-sm shadow-md hover:from-orange-600 hover:to-amber-600 transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isArabic ? "تسوق الآن" : "Profiter de l'offre"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors border-none cursor-pointer"
              >
                {isArabic ? "إغلاق" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
