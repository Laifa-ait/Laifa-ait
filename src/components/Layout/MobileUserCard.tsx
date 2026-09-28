import React from "react";
import { useTranslation } from "react-i18next";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { OptimizedImage } from "../ui/OptimizedImage";
import { getRetroAvatar } from "../../utils/avatar";
import { ShieldCheck, Store, LogIn, ChevronRight } from "lucide-react";

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
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#dadce0] text-[#202124]">
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-base text-[#202124]">
              {t("Compte Olmart")}
            </h4>
            <p className="text-xs text-[#5f6368] font-normal leading-relaxed">
              {t("Connectez-vous pour accéder à vos commandes, adresses et préférences.")}
            </p>
          </div>
          <button
            onClick={() => {
              onNavigate("/auth");
              onClose();
            }}
            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2.5 px-5 rounded-full font-medium text-xs transition-all border-none cursor-pointer shadow-xs active:scale-98 mt-1"
          >
            {t("Se connecter")}
          </button>
        </div>
      </div>
    );
  }

  const role = userProfile?.role || "buyer";

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#dadce0] text-[#202124] space-y-4">
      {/* Profile Header Google Material 3 */}
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-[#1a73e8] bg-[#f8fafd] p-0.5">
            <OptimizedImage
              src={
                userProfile?.photoURL ||
                currentUser.photoURL ||
                getRetroAvatar(currentUser.email || currentUser.uid)
              }
              alt={userProfile?.displayName || currentUser.email || "User Avatar"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#34a853] border-2 border-white rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-[#202124] truncate leading-tight">
            {userProfile?.displayName || currentUser.displayName || currentUser.email}
          </h4>
          <p className="text-[11px] text-[#5f6368] truncate mt-0.5">{currentUser.email}</p>
          <span className="inline-block text-[10px] font-medium text-[#1967d2] bg-[#e8f0fe] px-2 py-0.5 rounded-full mt-1">
            {role === "admin"
              ? "Administrateur"
              : role === "seller"
                ? "Vendeur Pro"
                : "Compte Client"}
          </span>
        </div>
      </div>

      {/* Main Google Account Button */}
      <button
        onClick={() => {
          onNavigate("/dashboard/buyer");
          onClose();
        }}
        className="w-full py-2.5 px-4 bg-white hover:bg-[#f8fafd] text-[#1a73e8] text-xs font-medium rounded-full text-center transition-all cursor-pointer border border-[#dadce0] shadow-xs flex items-center justify-center gap-2 active:scale-98"
      >
        <span>{t("Gérer votre compte Olmart")}</span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>

      {/* Role specific shortcuts */}
      {(role === "seller" || role === "admin") && (
        <div className="flex items-center gap-2 pt-1 border-t border-[#f1f3f4]">
          {role === "seller" && (
            <button
              onClick={() => {
                onNavigate("/dashboard/seller");
                onClose();
              }}
              className="flex-1 py-2 px-3 bg-[#f3e8fd] hover:bg-[#ebd4fc] text-[#7627bb] text-xs font-medium rounded-xl text-center transition-all cursor-pointer border border-[#e9d5ff] flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t("Dashboard Vendeur")}</span>
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => {
                onNavigate("/dashboard/admin");
                onClose();
              }}
              className="flex-1 py-2 px-3 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] text-xs font-medium rounded-xl text-center transition-all cursor-pointer border border-[#f8b4b4] flex items-center justify-center gap-1.5 active:scale-98"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("Administration")}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
