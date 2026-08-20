import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface NewKeyData {
  key: string;
  fr: string;
  ar: string;
  en: string;
}

interface NewKeyModalProps {
  showNewKeyModal: boolean;
  setShowNewKeyModal: (show: boolean) => void;
  newKeyData: NewKeyData;
  setNewKeyData: React.Dispatch<React.SetStateAction<NewKeyData>>;
  handleAddNewKey: () => Promise<void>;
}

export const NewKeyModal: React.FC<NewKeyModalProps> = ({
  showNewKeyModal,
  setShowNewKeyModal,
  newKeyData,
  setNewKeyData,
  handleAddNewKey,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-2xl p-10 space-y-8 max-w-3xl w-full"
            id="new-key-modal"
          >
            <div className="flex items-center justify-between border-b border-zinc-50 pb-6">
              <div>
                <h4 className="text-lg font-sans font-bold text-zinc-950">{t("Nouvelle Clé de Traduction")}</h4>
                <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
                  {t("Saisie manuelle pour l'UI d'Olma Marketplace")}
                </p>
              </div>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center transition-all cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-2">
                  {t("ID de la clé (Unique, ex: header.title)")}
                </label>
                <input
                  type="text"
                  value={newKeyData.key}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, key: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-bold text-zinc-800 outline-none focus:border-orange-500 text-xs transition-all"
                  placeholder={t("ex: menu.furniture") || "ex: menu.furniture"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-2">
                  {t("Texte Français (Source)")}
                </label>
                <input
                  type="text"
                  value={newKeyData.fr}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, fr: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-medium text-zinc-800 outline-none focus:border-orange-500 text-xs transition-all"
                  placeholder={t("ex: Meubles & Décorations") || "ex: Meubles & Décorations"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-2">
                  {t("Texte Anglais")}
                </label>
                <input
                  type="text"
                  value={newKeyData.en}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, en: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-medium text-zinc-800 outline-none focus:border-orange-500 text-xs transition-all"
                  placeholder={t("ex: Furniture & Decors") || "ex: Furniture & Decors"}
                />
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-2">
                  {t("Texte Arabe (RTL)")}
                </label>
                <input
                  type="text"
                  value={newKeyData.ar}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, ar: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-sans font-bold text-zinc-800 text-end outline-none focus:border-orange-500 text-xs transition-all"
                  dir="rtl"
                  placeholder="الأثاث والديكور"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-6 py-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer"
              >
                {t("Annuler")}
              </button>
              <button
                onClick={handleAddNewKey}
                className="px-8 py-3 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal transition-all shadow-md cursor-pointer border-none"
              >
                {t("Créer la Clé")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
