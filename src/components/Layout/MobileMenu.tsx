import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShoppingBag,
  Heart,
  Info,
  LogOut,
  Globe,
  Wrench,
  Building2,
  Store,
  Scale,
  Truck,
  Headphones,
} from "lucide-react";
import { useMobileMenu } from "../../hooks/useMobileMenu";
import { useMegaMenu } from "../../context/MegaMenuContext";
import { MobileUserCard } from "./MobileUserCard";
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
              } w-[84vw] max-w-[340px] bg-white z-[110] shadow-2xl flex flex-col overflow-hidden border-l border-cyan-900/10`}
            >
              {/* Subtle Texture */}
              <div className="absolute inset-0 bg-[url('/images/textures/arabesque.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 relative z-10 border-b border-cyan-900/5">
                <h2 className="text-lg font-bold text-cyan-950 tracking-tight">
                  {t("menu")}
                </h2>
                <button
                  onClick={closeMenu}
                  aria-label="Fermer le menu"
                  className="p-1.5 -mr-1 rounded-full text-cyan-800 hover:text-pink-600 hover:bg-cyan-50 cursor-pointer transition-colors border-none bg-transparent"
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 pb-6 space-y-4 scrollbar-hide relative z-10">
                {/* User Section (Redimensionné et ergonomique) */}
                <MobileUserCard
                  currentUser={currentUser}
                  userProfile={userProfile}
                  onNavigate={handleNav}
                  onClose={closeMenu}
                />

                {/* Quick Actions (Catalogue & Favoris) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      handleNav("/shop");
                      closeMenu();
                    }}
                    className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-[#E8F6F8] active:scale-98 transition-all text-center gap-1.5 cursor-pointer border border-[#E8F6F8] shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#F2FAFB] group-hover:bg-white flex items-center justify-center text-[#0088A8] transition-colors shadow-xs border border-[#E8F6F8]">
                      <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-bold text-cyan-950 tracking-wide">
                      {t("catalog") || "Catalogue"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleNav("/shop#wishlist");
                      closeMenu();
                    }}
                    className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-[#FDF0F5] active:scale-98 transition-all text-center gap-1.5 cursor-pointer border border-[#FDF0F5] shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#FDF0F5] group-hover:bg-white flex items-center justify-center text-[#D92B6B] transition-colors shadow-xs border border-[#FCE4EC]">
                      <Heart className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-bold text-pink-900 tracking-wide">
                      {t("favorites") || "Favoris"}
                    </span>
                  </button>
                </div>

                {/* Olmart Universes & Services Grid */}
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Univers & Services Olmart
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      58 Wilayas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleNav("/bricolage");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-white hover:bg-amber-50 border border-zinc-200 hover:border-amber-200 transition-all text-left cursor-pointer shadow-xs group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
                        <Wrench className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-amber-700">
                          Olma Bricolage
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">Artisans & Pro</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleNav("/immo");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 transition-all text-left cursor-pointer shadow-xs group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-emerald-700">
                          Olma Immo
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">Location & Vente</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleNav("/shops");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-200 transition-all text-left cursor-pointer shadow-xs group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-700">
                          Boutiques
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">Marques & Stores</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleNav("/comparator");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-white hover:bg-purple-50 border border-zinc-200 hover:border-purple-200 transition-all text-left cursor-pointer shadow-xs group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Scale className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-purple-700">
                          Comparateur
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">Prix & Produits</p>
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60">
                    <button
                      onClick={() => {
                        handleNav("/shipping-calculator");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/70 hover:bg-white text-zinc-700 text-xs font-semibold transition-all border border-zinc-200/50 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">Tarifs Livraison</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNav("/support");
                        closeMenu();
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/70 hover:bg-white text-zinc-700 text-xs font-semibold transition-all border border-zinc-200/50 cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">Support & Aide</span>
                    </button>
                  </div>
                </div>

                {/* Language / Navigation Section */}
                <div className="bg-white p-2 rounded-2xl shadow-xs border border-[#E8F6F8]">
                  <button
                    onClick={handleLanguageToggle}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F2FAFB] transition-all cursor-pointer border-none bg-transparent group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F2FAFB] group-hover:bg-white flex items-center justify-center text-[#0088A8] shadow-xs border border-[#E8F6F8]/50">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-950">
                        {t("nav.language") || "Langue"}
                      </span>
                    </div>
                    <span className="uppercase text-xs text-[#D92B6B] font-bold bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                      {(i18n.language || "FR").split("-")[0]}
                    </span>
                  </button>
                </div>

                {/* Categories Accordion */}
                <MobileCategoriesAccordion
                  categories={categoriesData}
                  onNavigate={handleNav}
                  onClose={closeMenu}
                />
              </div>

              {/* Bottom Footer */}
              <div className="p-3.5 bg-white/95 backdrop-blur-md shrink-0 mt-auto shadow-[0_-8px_30px_-8px_rgba(0,136,168,0.08)] z-20 relative border-t border-cyan-900/5 space-y-2">
                <button
                  onClick={fetchAboutText}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#F2FAFB] hover:bg-[#E8F6F8] rounded-2xl text-[#0088A8] font-bold text-xs transition-colors cursor-pointer border border-[#E8F6F8] shadow-xs"
                >
                  <Info className="w-4 h-4" />
                  <span>{t("about_olma") || "À propos d'Olma"}</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-pink-600 hover:text-pink-700 font-bold text-xs transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                    <span>{t("logout") || "Se déconnecter"}</span>
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
