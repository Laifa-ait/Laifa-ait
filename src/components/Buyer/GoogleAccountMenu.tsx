import React from "react";
import {
  X,
  Settings,
  Package,
  ShieldCheck,
  MapPin,
  HelpCircle,
  LogOut,
  Store,
  ChevronRight,
  Camera,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar } from "../ui/UserAvatar";

interface GoogleAccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAccountMenu: React.FC<GoogleAccountMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };

  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Utilisateur";

  const quickLinks = [
    {
      label: t("Paramètres du compte"),
      sub: t("Général, sécurité et préférences"),
      icon: Settings,
      path: "/dashboard/buyer",
    },
    {
      label: t("Commandes et achats"),
      sub: t("Suivi des colis et factures"),
      icon: Package,
      path: "/dashboard/buyer?tab=orders",
    },
    {
      label: t("Sécurité et connexion"),
      sub: t("Mot de passe et 2FA"),
      icon: ShieldCheck,
      path: "/dashboard/buyer?tab=security",
    },
    {
      label: t("Adresses et livraisons"),
      sub: t("58 wilayas d'Algérie"),
      icon: MapPin,
      path: "/dashboard/buyer?tab=addresses",
    },
    {
      label: t("Aide et commentaires"),
      sub: t("Support et assistance client"),
      icon: HelpCircle,
      path: "/support",
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-start sm:justify-end sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full sm:w-[390px] max-w-full bg-[#f0f4f9] rounded-t-[32px] sm:rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.24)] border border-[#dadce0] z-[130] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="w-12 h-1 bg-[#c4c7c5] rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[#1f1f1f] font-medium text-base tracking-tight">Olmart</span>
            <span className="text-xs text-[#444746] font-normal">• Compte</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("Fermer")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#e0e3e7] transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-1 pb-4 flex flex-col items-center text-center shrink-0">
          <div className="relative mb-2">
            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser?.photoURL}
              displayName={displayName}
              email={currentUser?.email}
              providerData={currentUser?.providerData}
              size="xl"
              alt={displayName}
            />
            <button
              onClick={() => handleNav("/dashboard/buyer?tab=profile")}
              title={t("Modifier la photo")}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#dadce0] shadow-xs flex items-center justify-center text-[#444746] hover:text-[#1a73e8] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="font-semibold text-base text-[#1f1f1f] truncate max-w-[280px]">{displayName}</h3>
          <p className="text-xs text-[#444746] truncate max-w-[280px]">{currentUser?.email}</p>

          <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f0fe] text-[#1967d2] border border-[#d2e3fc]">
            {userProfile?.role === "admin"
              ? t("Compte Administrateur", "Compte Administrateur")
              : userProfile?.role === "seller"
              ? t("Compte Vendeur Pro", "Compte Vendeur Pro")
              : t("Compte Client", "Compte Client")}
          </span>

          <button
            onClick={() => handleNav("/dashboard/buyer")}
            className="mt-3 px-5 py-1.5 rounded-full border border-[#747775]/40 bg-white hover:bg-[#e1e3e1] text-[#1f1f1f] font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            {t("Gérer votre compte Olmart")}
          </button>
        </div>

        <div className="px-4 pb-4 overflow-y-auto space-y-2">
          <div className="bg-white rounded-[22px] border border-[#dadce0]/70 p-1 shadow-xs space-y-0.5">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-[16px] hover:bg-[#f2f4f8] transition-colors group cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f4f9] text-[#444746] group-hover:text-[#1a73e8] group-hover:bg-[#e8f0fe] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left rtl:text-right">
                      <p className="text-xs font-medium text-[#1f1f1f] group-hover:text-[#1a73e8] transition-colors">{item.label}</p>
                      <p className="text-[10px] text-[#444746]">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#747775] rtl:rotate-180" />
                </button>
              );
            })}
          </div>

          {userProfile?.role === "seller" && (
            <button
              onClick={() => handleNav("/dashboard/seller")}
              className="w-full flex items-center justify-between p-3 rounded-[20px] bg-white border border-[#dadce0]/70 hover:bg-[#f8fafd] transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f3e8fd] text-[#7627bb] flex items-center justify-center shrink-0"><Store className="w-4 h-4" /></div>
                <div className="text-left rtl:text-right"><p className="text-xs font-medium text-[#1f1f1f]">{t("Console Vendeur Pro")}</p></div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#747775]" />
            </button>
          )}

          {userProfile?.role === "admin" && (
            <button
              onClick={() => handleNav("/dashboard/admin")}
              className="w-full flex items-center justify-between p-3 rounded-[20px] bg-white border border-[#dadce0]/70 hover:bg-[#f8fafd] transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fce8e6] text-[#c5221f] flex items-center justify-center shrink-0"><Settings className="w-4 h-4" /></div>
                <div className="text-left rtl:text-right"><p className="text-xs font-medium text-[#1f1f1f]">{t("Console d'Administration")}</p></div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#747775]" />
            </button>
          )}

          <div className="pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-[#dadce0] bg-white hover:bg-[#fce8e6] text-[#c5221f] font-medium text-xs transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("Déconnexion")}</span>
            </button>
          </div>

          <div className="pt-1 text-center">
            <p className="text-[10px] text-[#444746] flex items-center justify-center gap-2">
              <button onClick={() => handleNav("/privacy-policy")} className="hover:underline cursor-pointer bg-transparent border-none text-[#444746] p-0 text-[10px]">{t("Confidentialité", "Confidentialité")}</button>
              <span>•</span>
              <button onClick={() => handleNav("/refund-policy")} className="hover:underline cursor-pointer bg-transparent border-none text-[#444746] p-0 text-[10px]">{t("Conditions", "Conditions")}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
