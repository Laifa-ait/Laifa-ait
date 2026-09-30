import React from "react";
import { useTranslation } from "react-i18next";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { UserAvatar } from "../ui/UserAvatar";
import { ShieldCheck, Store, LogIn, ChevronRight, User as UserIcon } from "lucide-react";

interface MobileUserCardProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export const MobileUserCard: React.FC<MobileUserCardProps> = ({
  currentUser,
  userProfile,
  onNavigate,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!currentUser) {
    return (
      <div className="bg-gradient-to-b from-white to-zinc-50/70 rounded-2xl p-4.5 border border-zinc-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#0088A8]/10 text-[#0088A8] flex items-center justify-center shrink-0 border border-[#0088A8]/15">
            <LogIn className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-zinc-900 leading-tight">
              {t("Bienvenue sur Olmart")}
            </h4>
            <p className="text-xs text-zinc-500 font-normal mt-1 leading-relaxed">
              {t("Connectez-vous pour suivre vos commandes et gérer vos favoris.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onNavigate("/auth");
            onClose();
          }}
          className="w-full mt-3.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0088A8] hover:bg-[#00738e] active:scale-98 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer border-none"
        >
          <span>{t("Se connecter / S'inscrire")}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  const role = userProfile?.role || "buyer";
  const displayName =
    userProfile?.displayName ||
    currentUser.displayName ||
    currentUser.email?.split("@")[0] ||
    "Utilisateur";

  return (
    <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs space-y-3.5">
      {/* Profil Utilisateur avec Avatar Haute Définition */}
      <div className="flex items-center gap-3.5">
        <UserAvatar
          photoURL={userProfile?.photoURL || currentUser.photoURL}
          displayName={displayName}
          email={currentUser.email}
          size="lg"
          showOnlineBadge={true}
          role={role}
          alt={displayName}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-sm text-zinc-900 truncate leading-snug">
              {displayName}
            </h4>
            {role === "admin" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                <ShieldCheck className="w-3 h-3 text-rose-600" />
                <span>{t("Admin", "Admin")}</span>
              </span>
            )}
            {role === "seller" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                <Store className="w-3 h-3 text-indigo-600" />
                <span>{t("Vendeur", "Vendeur")}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5 font-normal">
            {currentUser.email}
          </p>
        </div>
      </div>

      {/* Boutons d'Action Ergonomiques */}
      <div className="space-y-2 pt-1 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => {
            onNavigate("/dashboard/buyer");
            onClose();
          }}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-all border border-zinc-200/80 active:scale-98 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-zinc-700 border border-zinc-200/60 shadow-2xs">
              <UserIcon className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span>{t("Gérer mon compte Olmart")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 rtl:rotate-180" />
        </button>

        {role === "admin" && (
          <button
            type="button"
            onClick={() => {
              onNavigate("/dashboard/admin");
              onClose();
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 text-rose-900 text-xs font-semibold transition-all border border-rose-200 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{t("Espace Administration")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500 rtl:rotate-180" />
          </button>
        )}

        {role === "seller" && (
          <button
            type="button"
            onClick={() => {
              onNavigate("/dashboard/seller");
              onClose();
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 text-xs font-semibold transition-all border border-indigo-200 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                <Store className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{t("Espace Vendeur Pro")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-500 rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
};
