import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { X, Info, LogOut, Globe } from "lucide-react";
import { useMobileMenu } from "../../hooks/useMobileMenu";
import { useMegaMenu } from "../../context/MegaMenuContext";
import { useUI } from "../../context/UIContext";
import { MobileUserCard } from "./MobileUserCard";
import { MobileMenuQuickActions } from "./MobileMenuQuickActions";
import { MobileMenuServices } from "./MobileMenuServices";
import { MobileCategoriesAccordion } from "./MobileCategoriesAccordion";
import { AboutOlmaModal } from "./AboutOlmaModal";

export const MobileMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    currentUser,
    userProfile,
    isMobileMenuOpen,
    isAboutOpen,
    setIsAboutOpen,
    aboutText,
    isLoadingAbout,
    fetchAboutText,
    closeMenu,
    handleNav,
    handleLanguageToggle,
    logout,
  } = useMobileMenu();
  const { categoriesData } = useMegaMenu();
  const { setIsCartOpen } = useUI();

  const isRtl = i18n.dir() === "rtl" || i18n.language === "ar";

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100]"
            />
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`fixed top-0 bottom-0 ${
                isRtl ? "left-0 rounded-r-2xl" : "right-0 rounded-l-2xl"
              } w-[86vw] max-w-[360px] bg-white z-[110] shadow-2xl flex flex-col overflow-hidden border-l border-zinc-200/80`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4.5 pt-4 pb-3 relative z-10 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0088A8] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    OL
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                    {t("Menu")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Fermer le menu"
                  className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer transition-colors border-none bg-transparent"
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 scrollbar-hide relative z-10">
                {/* Carte Profil Utilisateur avec Avatar Réel et Boutons Ergonomiques */}
                <MobileUserCard
                  currentUser={currentUser}
                  userProfile={userProfile}
                  onNavigate={handleNav}
                  onClose={closeMenu}
                />

                {/* Raccourcis Rapides (Catalogue, Favoris, Commandes, Panier) */}
                <MobileMenuQuickActions
                  onNavigate={handleNav}
                  onClose={closeMenu}
                  onOpenCart={() => setIsCartOpen(true)}
                />

                {/* Univers & Services Olmart avec Titres Complets Non-Tronqués */}
                <MobileMenuServices
                  onNavigate={handleNav}
                  onClose={closeMenu}
                />

                {/* Sélecteur de Langue */}
                <button
                  type="button"
                  onClick={handleLanguageToggle}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 shadow-2xs transition-all cursor-pointer text-left rtl:text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <Globe className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-800">
                      {t("Langue d'affichage")}
                    </span>
                  </div>
                  <span className="uppercase text-[11px] font-bold text-[#0088A8] bg-[#0088A8]/10 px-2 py-0.5 rounded-md">
                    {(i18n.language || "FR").split("-")[0]}
                  </span>
                </button>

                {/* Accordéon des Catégories */}
                <MobileCategoriesAccordion
                  categories={categoriesData}
                  onNavigate={handleNav}
                  onClose={closeMenu}
                />
              </div>

              {/* Pied de Page Épuré */}
              <div className="p-3 bg-zinc-50 border-t border-zinc-200/80 shrink-0 space-y-2 z-20">
                <button
                  type="button"
                  onClick={fetchAboutText}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-zinc-100 rounded-xl text-zinc-700 font-semibold text-xs transition-colors border border-zinc-200/80 shadow-2xs cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t("À propos d'Olmart")}</span>
                </button>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-rose-600 hover:text-rose-700 font-semibold text-xs transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                    <span>{t("Se déconnecter")}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AboutOlmaModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        isLoading={isLoadingAbout}
        text={aboutText}
      />
    </>
  );
};
