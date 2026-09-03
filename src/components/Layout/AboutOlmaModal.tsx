import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AboutOlmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  text: string;
}

export const AboutOlmaModal: React.FC<AboutOlmaModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  text,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-transparent text-zinc-500 rounded-full hover:bg-zinc-100 hover:text-zinc-900 transition-colors border-none cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl justify-center items-center flex bg-sky-50 text-sky-600">
                <Info className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900">{t("about_olma") || "À propos d'Olma"}</h3>
            </div>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3.5 bg-zinc-100 rounded w-full" />
                <div className="h-3.5 bg-zinc-100 rounded w-5/6" />
                <div className="h-3.5 bg-zinc-100 rounded w-4/6" />
              </div>
            ) : (
              <div className="prose prose-slate prose-sm font-normal text-sm leading-relaxed text-zinc-600 whitespace-pre-wrap">
                {text}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
