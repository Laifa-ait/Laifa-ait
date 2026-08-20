import React from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserProfile } from "../../../../domains/user/user.types";

interface SellerDashboardAlertsProps {
  userProfile: UserProfile | null;
}

export const SellerDashboardAlerts: React.FC<SellerDashboardAlertsProps> = ({ userProfile }) => {
  const { t } = useTranslation();

  const isVelocitySuspended = userProfile?.isVelocitySuspended === true;
  const isPendingOrDraft = userProfile?.status === "PENDING" || userProfile?.status === "DRAFT";

  if (!isVelocitySuspended && !isPendingOrDraft) return null;

  return (
    <div className="space-y-4" id="seller-dashboard-alerts">
      {isVelocitySuspended && (
        <div
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-700"
          id="seller-velocity-suspension-alert"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="text-xs">
            <span className="font-bold">
              {t("Paiements suspendus pour vérification de vélocité.")}
            </span>{" "}
            {t(
              "Votre boutique a dépassé le plafond de volume sécurisé temporaire. Veuillez fournir les justificatifs nécessaires à l'équipe support."
            )}
          </div>
        </div>
      )}

      {isPendingOrDraft && (
        <div
          className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-800"
          id="seller-sandbox-mode-alert"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold">{t("Mode Sandbox & Validation :")}</span>{" "}
              {t(
                "Votre boutique est en cours d'examen. Vos produits ne seront visibles par les acheteurs qu'après validation de vos documents."
              )}
            </div>
          </div>
          <a
            href="/dashboard/seller/verification"
            className="text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-colors shrink-0 text-decoration-none"
          >
            {t("Vérifier maintenant")}
          </a>
        </div>
      )}
    </div>
  );
};
