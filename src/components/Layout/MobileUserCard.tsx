import React from "react";
import { useTranslation } from "react-i18next";
import { User as FirebaseUser } from "firebase/auth";
import { UserProfile } from "../../domains/user/user.types";
import { OptimizedImage } from "../ui/OptimizedImage";
import { getRetroAvatar } from "../../utils/avatar";

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
      <div className="bg-[#0088A8] rounded-2xl p-4 shadow-sm border border-cyan-600/30">
        <div className="flex flex-col gap-3 items-center text-center">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-white drop-shadow-xs">
              {t("Rejoignez Olma")}
            </h4>
            <p className="text-xs text-cyan-100 font-medium">
              {t("Connectez-vous pour une expérience personnalisée.")}
            </p>
          </div>
          <button
            onClick={() => {
              onNavigate("/auth");
              onClose();
            }}
            className="w-full bg-white hover:bg-cyan-50 text-[#0088A8] py-2.5 px-4 rounded-xl font-bold text-xs transition-all border-none cursor-pointer shadow-xs active:scale-98"
          >
            {t("Se connecter")}
          </button>
        </div>
      </div>
    );
  }

  const role = userProfile?.role || "buyer";

  return (
    <div className="bg-[#0088A8] rounded-2xl p-4 shadow-sm border border-cyan-600/30 space-y-3">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-xs border-2 border-white/40 bg-white/10 p-0.5">
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
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[15px] text-white truncate leading-snug drop-shadow-xs">
            {userProfile?.displayName || currentUser.email}
          </h4>
          <span className="inline-block text-[11px] font-semibold text-cyan-100 bg-white/15 px-2.5 py-0.5 rounded-md mt-0.5">
            {role === "admin"
              ? t("common.admin")
              : role === "seller"
                ? t("common.seller")
                : t("common.buyer")}
          </span>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() => {
            onNavigate("/dashboard/buyer");
            onClose();
          }}
          className="flex-1 py-2.5 px-3 bg-white hover:bg-cyan-50 text-cyan-950 text-xs font-bold rounded-xl text-center transition-all cursor-pointer border-none shadow-xs active:scale-98"
        >
          {t("common.my_space")}
        </button>

        {role === "seller" && (
          <button
            onClick={() => {
              onNavigate("/dashboard/seller");
              onClose();
            }}
            className="flex-1 py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-950/60 text-white text-xs font-bold rounded-xl text-center transition-all cursor-pointer border border-white/20 shadow-xs active:scale-98"
          >
            {t("seller_dashboard")}
          </button>
        )}

        {role === "admin" && (
          <button
            onClick={() => {
              onNavigate("/dashboard/admin");
              onClose();
            }}
            className="flex-1 py-2.5 px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl border-none text-center transition-all cursor-pointer shadow-xs active:scale-98"
          >
            {t("common.admin")}
          </button>
        )}
      </div>
    </div>
  );
};
