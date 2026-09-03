import React from "react";
import { motion } from "motion/react";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerRejectModalProps {
  rejectModalOpen: boolean;
  setRejectModalOpen: (open: boolean) => void;
  rejectReasons: string[];
  setRejectReasons: (reasons: string[]) => void;
  rejectComment: string;
  setRejectComment: (comment: string) => void;
  handleConfirmReject: () => void;
}

export const SellerRejectModal: React.FC<SellerRejectModalProps> = ({
  rejectModalOpen,
  setRejectModalOpen,
  rejectReasons,
  setRejectReasons,
  rejectComment,
  setRejectComment,
  handleConfirmReject,
}) => {
  const { t } = useTranslation();

  if (!rejectModalOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute z-50 bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl"
    >
      <h4 className="text-xl font-sans font-bold text-zinc-950 flex items-center gap-2 mb-6">
        <XCircle className="w-6 h-6 text-red-500" />
        {t("Raison du Rejet")}
      </h4>
      <div className="space-y-4 mb-6">
        {[t("Document illisible"), t("Extrait RC expiré"), t("NIF incorrect"), t("Autre")].map((reason) => (
          <label key={reason} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rejectReasons.includes(reason)}
              onChange={(e) => {
                if (e.target.checked) setRejectReasons([...rejectReasons, reason]);
                else setRejectReasons(rejectReasons.filter((r) => r !== reason));
              }}
              className="w-5 h-5 accent-red-500 rounded"
            />
            <span className="font-bold text-sm">{reason}</span>
          </label>
        ))}
      </div>
      <div className="relative mb-6">
        <textarea
          maxLength={500}
          placeholder={t("Commentaire optionnel pour le vendeur...") || "Commentaire optionnel pour le vendeur..."}
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-bold text-sm outline-none resize-none"
          rows={3}
        />
        <div className="absolute bottom-3 end-4 text-[10px] text-zinc-400 font-bold">
          {rejectComment.length}/500
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleConfirmReject}
          className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal shadow-xl shadow-red-500/20 cursor-pointer"
        >
          {t("Confirmer Rejet")}
        </button>
        <button
          onClick={() => setRejectModalOpen(false)}
          className="px-6 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal cursor-pointer"
        >
          {t("Annuler")}
        </button>
      </div>
    </motion.div>
  );
};
