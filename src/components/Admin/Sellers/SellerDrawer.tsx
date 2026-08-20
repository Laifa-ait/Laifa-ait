import { Shop } from "../../../domains/seller/shop.types";
import { UserProfile } from "../../../domains/user/user.types";
import { User as FirebaseUser } from "firebase/auth";
import React from "react";
import { motion } from "motion/react";
import {
  Search,
  Video,
  ShieldCheck,
  XCircle,
  ShieldOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiPatch, apiPost } from "../../../lib/api";
import toast from "react-hot-toast";
import { SellerDrawerDetails } from "./SellerDrawerDetails";

interface OcrResult {
  fullName?: string;
  documentNumber?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  [key: string]: string | undefined;
}

interface SellerDrawerProps {
  selectedSeller: Shop | null;
  setSelectedSeller: (seller: Shop | null) => void;
  setPreviewDocUrl: (url: string | null) => void;
  currentUser: FirebaseUser | UserProfile | null;
  setSellers: React.Dispatch<React.SetStateAction<Shop[]>>;
  sellers: Shop[];
  ocrLoading: boolean;
  setOcrLoading: (loading: boolean) => void;
  ocrResult: OcrResult | null;
  setOcrResult: (result: OcrResult | null) => void;
  handleScheduleMeet: (sellerId: string, email: string) => void;
  handleUpdateStatus: (sellerId: string, status: "active" | "rejected" | "suspended") => void;
  setRejectModalOpen: (open: boolean) => void;
}

export const SellerDrawer: React.FC<SellerDrawerProps> = ({
  selectedSeller,
  setSelectedSeller,
  setPreviewDocUrl,
  currentUser,
  setSellers,
  sellers,
  ocrLoading,
  setOcrLoading,
  ocrResult,
  setOcrResult,
  handleScheduleMeet,
  handleUpdateStatus,
  setRejectModalOpen,
}) => {
  const { t } = useTranslation();

  if (!selectedSeller) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedSeller(null)}
        className="absolute inset-0 bg-zinc-950/90"
      />
      <motion.div
        layoutId="seller-modal"
        className="relative bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <SellerDrawerDetails
          selectedSeller={selectedSeller}
          setPreviewDocUrl={setPreviewDocUrl}
          currentUser={currentUser}
          ocrLoading={ocrLoading}
          setOcrLoading={setOcrLoading}
          ocrResult={ocrResult}
          setOcrResult={setOcrResult}
        />

        <div className="w-full md:w-96 bg-zinc-50 p-12 flex flex-col justify-between border-l border-zinc-100">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-4">
                {t("Statut Actuel")}
              </p>
              <h5
                className={`text-2xl font-black uppercase tracking-tighter rtl:tracking-normal ${
                  selectedSeller.status === "active" ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {selectedSeller.status}
              </h5>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">
                {t("Notes Internes")}
              </p>
              <div className="relative">
                <textarea
                  value={selectedSeller.internalNotes || ""}
                  onChange={(e) => {
                    setSelectedSeller({ ...selectedSeller, internalNotes: e.target.value });
                  }}
                  onBlur={async () => {
                    try {
                      await apiPatch(`/api/v1/admin/sellers/${selectedSeller.id}/details`, {
                        internalNotes: selectedSeller.internalNotes || "",
                      });
                      toast.success(t("Notes internes sauvegardées"));
                    } catch {
                      toast.error(t("Erreur de sauvegarde"));
                    }
                  }}
                  placeholder={t("Notes pour l'équipe (invisibles au vendeur)...")}
                  className="w-full bg-white border border-zinc-200 rounded-2xl p-4 font-bold text-xs outline-none resize-none h-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">
                {t("Commission Partenaire (%)")}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedSeller.commissionRate !== undefined ? selectedSeller.commissionRate : 10}
                  onChange={(e) => {
                    const val = Math.min(Math.max(Number(e.target.value), 0), 100);
                    setSelectedSeller({ ...selectedSeller, commissionRate: val });
                  }}
                  className="w-24 bg-white border border-zinc-200 rounded-2xl p-4 font-bold text-sm text-zinc-950 outline-none shadow-sm"
                />
                <button
                  onClick={async () => {
                    try {
                      await apiPatch(`/api/v1/admin/sellers/${selectedSeller.id}/details`, {
                        commissionRate: selectedSeller.commissionRate ?? 10,
                      });
                      toast.success(t("Taux de commission mis à jour !"));
                      setSellers(
                        sellers.map((s) =>
                          s.id === selectedSeller.id ? { ...s, commissionRate: selectedSeller.commissionRate } : s
                        )
                      );
                    } catch {
                      toast.error(t("Erreur de sauvegarde"));
                    }
                  }}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] text-[10px] font-bold uppercase tracking-widest cursor-pointer active:scale-95 transition-all text-center border-none"
                >
                  {t("Sauvegarder")}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2">
                {t("Actions de Modération")}
              </p>

              <button
                onClick={async () => {
                  try {
                    if (!selectedSeller.nifNumber) {
                      toast.error(t("Aucun NIF spécifié pour ce vendeur."));
                      return;
                    }
                    const res = await apiPost<{ success: boolean; count: number }>(
                      "/api/v1/admin/sellers/check-nif",
                      { nifNumber: selectedSeller.nifNumber, sellerId: selectedSeller.id }
                    );
                    if (res.count > 0) {
                      toast.error(t(`Attention: ${res.count} autre(s) compte(s) trouvé(s) avec ce NIF!`));
                    } else {
                      toast.success(t("Aucun doublon trouvé pour ce NIF."));
                    }
                  } catch {
                    toast.error(t("Erreur lors de la vérification."));
                  }
                }}
                className="w-full bg-amber-100 text-amber-700 py-4 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Search className="w-4 h-4" /> {t("Vérifier Doublons (NIF)")}
              </button>

              <button
                onClick={() => handleScheduleMeet(selectedSeller.id, selectedSeller.email || "")}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-none"
              >
                <Video className="w-5 h-5" /> {t("Planifier Meet (Vérif.)")}
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedSeller.id, "active")}
                className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[11px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-none"
              >
                <ShieldCheck className="w-5 h-5" /> {t("Valider le partenaire")}
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="w-full bg-white text-red-600 border border-red-100 py-5 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[11px] shadow-xl shadow-red-500/5 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <XCircle className="w-5 h-5" /> {t("Rejeter Dossier")}
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedSeller.id, "suspended")}
                className="w-full bg-zinc-950 text-white py-5 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[11px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-none"
              >
                <ShieldOff className="w-5 h-5" /> {t("Suspendre Compte")}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedSeller(null);
              setRejectModalOpen(false);
            }}
            className="mt-12 text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal hover:text-zinc-950 transition-colors cursor-pointer border-none bg-transparent"
          >
            {t("Fermer le Panel")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
