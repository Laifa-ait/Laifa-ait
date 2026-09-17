import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, HardDrive, FileText, BarChart3, X, Check } from "lucide-react";
import { useDataConsent } from "../../context/DataConsentContext";
import { UserDataConsentPreferences } from "../../types/documents";

export const DataConsentModal: React.FC = () => {
  const { isConsentModalOpen, closeConsentModal, preferences, savePreferences, acceptAll } = useDataConsent();
  const [localPrefs, setLocalPrefs] = useState<UserDataConsentPreferences>(preferences);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isConsentModalOpen) {
      setLocalPrefs(preferences);
    }
  }, [isConsentModalOpen, preferences]);

  if (!isConsentModalOpen) return null;

  const handleSave = () => {
    savePreferences(localPrefs);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Gestion des données & Mémoire</h3>
                <p className="text-xs text-slate-500 font-medium">Loi algérienne 18-07 relative à la protection des données</p>
              </div>
            </div>
            <button
              onClick={closeConsentModal}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto text-sm">
            <p className="text-slate-600 text-xs leading-relaxed">
              Pour vous permettre de téléverser vos documents (actes notariés, CNRC, justificatifs) et garantir une vitesse optimale, Olmart demande l'autorisation d'exploiter la mémoire de votre appareil et de stocker vos fichiers en toute sécurité.
            </p>

            {/* Option 1: Essentiel */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Fonctionnement Essentiel</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Requis</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Authentification sécurisée, protection CSRF et sauvegarde temporaire de votre panier d'achat.
                  </p>
                </div>
              </div>
              <input type="checkbox" checked disabled className="rounded text-orange-600 w-5 h-5 accent-orange-600 mt-1 cursor-not-allowed opacity-70" />
            </div>

            {/* Option 2: Mémoire & Documents */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Mémoire & Téléversement de Documents</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Autorise l'application à utiliser la mémoire de votre appareil pour téléverser et prévisualiser vos actes de propriété, pièces d'identité et justificatifs.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.documentMemory}
                onChange={(e) => setLocalPrefs((p) => ({ ...p, documentMemory: e.target.checked }))}
                className="rounded text-slate-800 w-5 h-5 accent-slate-800 mt-1 cursor-pointer"
              />
            </div>

            {/* Option 3: Cache local */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Mise en cache locale (Navigation hors-ligne)</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Conserve les images et données de navigation dans votre navigateur pour une réactivité instantanée et une économie de données mobiles.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.localStorageCache}
                onChange={(e) => setLocalPrefs((p) => ({ ...p, localStorageCache: e.target.checked }))}
                className="rounded text-slate-800 w-5 h-5 accent-slate-800 mt-1 cursor-pointer"
              />
            </div>

            {/* Option 4: Analytics */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Optimisation & Performances</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Mesure anonymisée de la stabilité technique de la plateforme pour éliminer les lenteurs.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.analyticsPerformance}
                onChange={(e) => setLocalPrefs((p) => ({ ...p, analyticsPerformance: e.target.checked }))}
                className="rounded text-slate-800 w-5 h-5 accent-slate-800 mt-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setLocalPrefs({ ...localPrefs, documentMemory: false, localStorageCache: false, analyticsPerformance: false });
                savePreferences({ documentMemory: false, localStorageCache: false, analyticsPerformance: false });
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-200/60 transition"
            >
              Refuser l'optionnel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
              >
                Enregistrer
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Tout accepter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
