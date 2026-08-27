import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { safeLogger } from "../../utils/logger";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: "email" | "sms";
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, method }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const res = await fetch("/api/v1/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error("Code invalide");

      toast.success("Compte vérifié avec succès !");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      safeLogger.warn("Failed to verify code", { err: msg });
      toast.error("Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[var(--color-slate-900, #0f172a)]/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="w-16 h-16 bg-[var(--color-orange-600, #ea580c)]/10 text-[var(--color-orange-600, #ea580c)] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] text-center mb-2">{t("Vérification 2FA")}</h3>
            <p className="text-sm text-zinc-500 text-center mb-6">
              {t("Entrez le code reçu par")}
              {method === "email" ? "e-mail" : "SMS"}.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full text-center text-2xl font-bold tracking-[0.5em] py-4 bg-zinc-50 border border-zinc-200 rounded-xl mb-6 outline-none focus:border-[var(--color-orange-600, #ea580c)]"
              placeholder="000000"
            />
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-4 bg-[var(--color-slate-900, #0f172a)] text-white rounded-2xl font-bold hover:bg-[#0a0b0c] transition-all disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Valider le code"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
