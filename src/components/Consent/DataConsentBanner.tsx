import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { HardDrive, Settings2, Check } from "lucide-react";
import { useDataConsent } from "../../context/DataConsentContext";
import { DataConsentModal } from "./DataConsentModal";

export const DataConsentBanner: React.FC = () => {
  const { hasConsented, acceptAll, openConsentModal } = useDataConsent();

  if (hasConsented) {
    return <DataConsentModal />;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9990]"
        >
          <div className="bg-white text-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-900">
                  Stockage & documents
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Autoriser l'utilisation de la mémoire locale pour sécuriser vos documents et fluidifier votre navigation.
                </p>
                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    onClick={acceptAll}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accepter
                  </button>
                  <button
                    onClick={openConsentModal}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Personnaliser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <DataConsentModal />
    </>
  );
};

