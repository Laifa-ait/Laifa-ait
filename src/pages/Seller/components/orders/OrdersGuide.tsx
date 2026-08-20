import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Info,
  ChevronUp,
  CheckSquare,
  PackageCheck,
  Truck,
  HandCoins,
  ArrowRight,
} from "lucide-react";

interface OrdersGuideProps {
  showGuide: boolean;
  onToggleGuide: () => void;
}

export const OrdersGuide: React.FC<OrdersGuideProps> = ({ showGuide, onToggleGuide }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-6 sm:p-8 relative">
            <button
              onClick={onToggleGuide}
              className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full text-orange-400 hover:text-orange-600 transition-colors border border-orange-100"
              title={t("Masquer le guide") || "Masquer le guide"}
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <div className="absolute top-0 right-10 p-8 opacity-5 pointer-events-none hidden md:block">
              <BookOpen className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-orange-100 p-2.5 rounded-xl">
                  <Info className="w-6 h-6 text-[#ea580c]" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-orange-900 text-lg">
                    {t("Comment gérer vos commandes sur Olmart ?")}
                  </h3>
                  <p className="text-[#ea580c] text-xs font-bold mt-1">
                    {t("Un processus ultra-simple en 4 étapes pour garantir la satisfaction client")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Etape 1 */}
                <div className="bg-white/80 p-5 rounded-2xl border border-orange-100 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-sans font-bold tracking-widest rtl:tracking-normal text-white bg-[#ea580c] px-3 py-1.5 rounded-lg">
                      {t("ÉTAPE 1")}
                    </span>
                    <CheckSquare className="w-5 h-5 text-orange-400" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-zinc-950 mb-2 uppercase tracking-wide rtl:tracking-normal">
                    {t("Confirmation")}
                  </h4>
                  <p className="text-xs text-zinc-600 font-medium">
                    {t(
                      'Vérifiez la disponibilité de votre stock. Une fois certain de pouvoir honorer la commande, cliquez sur "Confirmer".'
                    )}
                  </p>
                </div>

                {/* Etape 2 */}
                <div className="bg-white/80 p-5 rounded-2xl border border-orange-100 shadow-sm relative">
                  <div className="hidden xl:block absolute -left-3 top-1/2 -translate-y-1/2 text-orange-200 z-10">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-sans font-bold tracking-widest rtl:tracking-normal text-white bg-[#ea580c] px-3 py-1.5 rounded-lg">
                      {t("ÉTAPE 2")}
                    </span>
                    <PackageCheck className="w-5 h-5 text-orange-400" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-zinc-950 mb-2 uppercase tracking-wide rtl:tracking-normal">
                    {t("Préparation")}
                  </h4>
                  <p className="text-xs text-zinc-600 font-medium">
                    {t(
                      'Emballez soigneusement le produit. Utilisez le bouton "Étiquettes/PDF" pour générer et imprimer le bordereau.'
                    )}
                  </p>
                </div>

                {/* Etape 3 */}
                <div className="bg-white/80 p-5 rounded-2xl border border-orange-100 shadow-sm relative">
                  <div className="hidden xl:block absolute -left-3 top-1/2 -translate-y-1/2 text-orange-200 z-10">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-sans font-bold tracking-widest rtl:tracking-normal text-white bg-[#ea580c] px-3 py-1.5 rounded-lg">
                      {t("ÉTAPE 3")}
                    </span>
                    <Truck className="w-5 h-5 text-orange-400" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-zinc-950 mb-2 uppercase tracking-wide rtl:tracking-normal">
                    {t("Expédition")}
                  </h4>
                  <p className="text-xs text-zinc-600 font-medium">
                    {t(
                      'Collez l\'étiquette sur votre colis et remettez-le au transporteur. Changez alors le statut en "Expédiée".'
                    )}
                  </p>
                </div>

                {/* Etape 4 */}
                <div className="bg-white/80 p-5 rounded-2xl border border-orange-100 shadow-sm relative">
                  <div className="hidden xl:block absolute -left-3 top-1/2 -translate-y-1/2 text-orange-200 z-10">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-sans font-bold tracking-widest rtl:tracking-normal text-[#ea580c] bg-orange-100 border border-[#ea580c]/20 px-3 py-1.5 rounded-lg">
                      {t("ÉTAPE 4")}
                    </span>
                    <HandCoins className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-emerald-950 mb-2 uppercase tracking-wide rtl:tracking-normal">
                    {t("Paiement Garanti")}
                  </h4>
                  <p className="text-xs text-zinc-600 font-medium">
                    {t(
                      "Une fois l'article livré par le transporteur, l'argent est crédité automatiquement sur votre \"Portefeuille\"."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
