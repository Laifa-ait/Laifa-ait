import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShoppingBag,
  Heart,
  Info,
  Box,
  LogOut,
  Globe,
  ChevronRight,
} from "lucide-react";
import { useMobileMenu } from "../../hooks/useMobileMenu";
import { useMegaMenu } from "../../context/MegaMenuContext";
import { CATEGORY_ICONS } from "../../constants";
import { getRetroAvatar } from "../../utils/avatar";
import { getCategoryTranslation } from "../../utils/translations";
import { OptimizedImage } from "../ui/OptimizedImage";

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
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const menuItems: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; path: string }> = [];

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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className={`fixed top-0 bottom-0 ${isRtl ? "left-0 rounded-r-[2rem]" : "right-0 rounded-l-[2rem]"} w-[85vw] max-w-[360px] bg-white z-[110] shadow-2xl flex flex-col overflow-hidden border-l border-cyan-900/10`}
            >
              {/* Subtle Texture */}
              <div className="absolute inset-0 bg-[url('/images/textures/arabesque.png')] opacity-[0.04] pointer-events-none mix-blend-multiply"></div>
              
              {/* Header / Top */}
              <div className="flex items-center justify-between px-8 pb-4 pt-10 relative z-10">
                <h2 className="text-2xl font-display font-bold text-cyan-950 tracking-tight">
                  {t("menu")}
                </h2>
                <button
                  onClick={closeMenu}
                  className="p-2 -mr-2 bg-transparent border-none text-cyan-800 hover:text-pink-600 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6 stroke-[2]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 space-y-8 scrollbar-hide relative z-10">
                {/* User Section (The "Blue Door" element) */}
                <div className="space-y-4">
                  {currentUser ? (
                    <div className="bg-[#0088A8] rounded-[2rem] p-6 shadow-md shadow-cyan-900/20 space-y-5 border border-cyan-600 relative overflow-hidden">
                      {/* Inner door detail */}
                      <div className="absolute inset-2 border border-cyan-400/30 rounded-[1.5rem] pointer-events-none"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-inner border-2 border-white/20 bg-white/10 p-0.5">
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
                          <h4 className="font-display font-bold text-lg text-white truncate drop-shadow-sm">
                            {userProfile?.displayName || currentUser.email}
                          </h4>
                          <p className="text-sm text-cyan-100 truncate font-medium">
                            {userProfile?.role === "admin"
                              ? t("common.admin")
                              : userProfile?.role === "seller"
                                ? t("common.seller")
                                : t("common.buyer")}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between gap-3 pt-2 relative z-10">
                        <button
                          onClick={() => {
                            handleNav("/dashboard/buyer");
                            closeMenu();
                          }}
                          className="flex-1 py-3 px-4 bg-white hover:bg-cyan-50 text-cyan-900 text-sm font-bold rounded-2xl text-center transition-colors cursor-pointer border-none shadow-sm"
                        >
                          {t("common.my_space")}
                        </button>
                        {userProfile?.role === "seller" && (
                          <button
                            onClick={() => {
                              handleNav("/dashboard/seller");
                              closeMenu();
                            }}
                            className="flex-1 py-3 px-4 bg-cyan-900/40 hover:bg-cyan-900/60 text-white text-sm font-medium rounded-2xl text-center transition-colors cursor-pointer border border-cyan-400/30 shadow-sm"
                          >
                            {t("seller_dashboard")}
                          </button>
                        )}
                        {userProfile?.role === "admin" && (
                          <button
                            onClick={() => {
                              handleNav("/dashboard/admin");
                              closeMenu();
                            }}
                            className="flex-1 py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded-2xl border-none text-center transition-colors cursor-pointer shadow-sm"
                          >
                            {t("common.admin")}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0088A8] rounded-[2rem] p-8 shadow-md shadow-cyan-900/20 relative overflow-hidden">
                       <div className="absolute inset-2 border border-cyan-400/30 rounded-[1.5rem] pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col gap-5 items-center text-center">
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-2xl text-white drop-shadow-sm">{t("Rejoignez Olma")}</h4>
                          <p className="text-sm text-cyan-100 font-medium">
                            {t("Connectez-vous pour une expérience personnalisée.")}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            handleNav("/auth");
                            closeMenu();
                          }}
                          className="w-full bg-white hover:bg-cyan-50 text-[#0088A8] py-3.5 rounded-2xl font-bold text-[15px] transition-colors border-none cursor-pointer shadow-sm"
                        >
                          {t("Se connecter")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      handleNav("/shop");
                      closeMenu();
                    }}
                    className="group flex flex-col items-center justify-center p-5 rounded-3xl bg-white hover:bg-[#E8F6F8] hover:shadow-md active:scale-95 transition-all text-center gap-3 cursor-pointer border border-[#E8F6F8] shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#F2FAFB] group-hover:bg-white flex items-center justify-center text-[#0088A8] transition-colors shadow-sm border border-[#E8F6F8]">
                      <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[13px] font-bold text-cyan-950 uppercase tracking-wider">{t("catalog") || "Catalogue"}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNav("/shop#wishlist");
                      closeMenu();
                    }}
                    className="group flex flex-col items-center justify-center p-5 rounded-3xl bg-white hover:bg-[#FDF0F5] hover:shadow-md active:scale-95 transition-all text-center gap-3 cursor-pointer border border-[#FDF0F5] shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#FDF0F5] group-hover:bg-white flex items-center justify-center text-[#D92B6B] transition-colors shadow-sm border border-[#FCE4EC]">
                      <Heart className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[13px] font-bold text-pink-900 uppercase tracking-wider">{t("favorites") || "Favoris"}</span>
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="space-y-3 bg-white p-2 rounded-[2rem] shadow-sm border border-[#E8F6F8]">
                  <h4 className="text-[10px] font-bold text-cyan-800/60 uppercase tracking-[0.2em] mb-2 px-4 pt-4">
                    {t("nav.sections.navigation")}
                  </h4>
                  <div className="space-y-1 pb-2 px-2">
                    {menuItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleNav(item.path);
                          closeMenu();
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F2FAFB] transition-all cursor-pointer border-none bg-transparent group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#F2FAFB] group-hover:bg-white flex items-center justify-center text-[#0088A8] shadow-sm border border-[#E8F6F8]/50">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[15px] font-semibold text-cyan-950">{item.label}</span>
                      </button>
                    ))}{" "}
                    <button
                      onClick={handleLanguageToggle}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F2FAFB] transition-all cursor-pointer border-none bg-transparent group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F2FAFB] group-hover:bg-white flex items-center justify-center text-[#0088A8] shadow-sm border border-[#E8F6F8]/50">
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className="text-[15px] font-semibold text-cyan-950">
                        {t("nav.language") || "Langue"}:{" "}
                        <span className="uppercase text-[#D92B6B] font-bold">
                          {(i18n.language || "FR").split("-")[0]}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Catégories Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-cyan-800/60 uppercase tracking-[0.2em] mb-2 px-2">
                    {t("nav.sections.categories")}
                  </h4>
                  <div className="flex flex-col space-y-3">
                    {categoriesData.map((cat, i) => {
                      const IconComponent = CATEGORY_ICONS[cat.name] || Box;
                      const isExpanded = expandedCat === cat.id;

                      return (
                        <div key={i} className="bg-white rounded-[1.5rem] shadow-sm border border-[#E8F6F8] overflow-hidden">
                          <button
                            onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                            className="w-full flex items-center justify-between p-4 bg-transparent border-none cursor-pointer hover:bg-[#F2FAFB] group transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-xl bg-[#F2FAFB] group-hover:bg-white transition-colors border border-transparent group-hover:border-[#E8F6F8] shadow-sm">
                                <IconComponent className="w-5 h-5 text-[#0088A8] stroke-[1.5]" />
                              </div>
                              <span className="font-semibold text-[15px] text-cyan-950 group-hover:text-[#0088A8] transition-colors">
                                {getCategoryTranslation(cat.name, t)}
                              </span>
                            </div>
                            {cat.sections && cat.sections.length > 0 && (
                              <ChevronRight
                                className={`w-5 h-5 transition-transform duration-300 text-cyan-800/40 ${isExpanded ? "rotate-90 text-[#D92B6B]" : ""}`}
                              />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpanded && cat.sections && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-[#F2FAFB]/50 border-t border-[#E8F6F8]/50"
                              >
                                <div className="px-5 py-3 space-y-1">
                                  {cat.sections.map((sec, j) => (
                                    <button
                                      key={j}
                                      onClick={() => {
                                        handleNav(
                                          `/shop?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sec.name)}`
                                        );
                                        closeMenu();
                                      }}
                                      className="block w-full text-start text-[14px] text-cyan-900/70 hover:text-[#D92B6B] hover:bg-white font-medium border-none bg-transparent cursor-pointer transition-all p-3 rounded-xl"
                                    >
                                      {getCategoryTranslation(sec.name, t)}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky/Fixed Bottom Footer */}
              <div className="p-6 bg-white/80 backdrop-blur-lg shrink-0 mt-auto shadow-[0_-10px_40px_-10px_rgba(0,136,168,0.1)] z-20 relative border-t border-cyan-900/5">
                <button
                  onClick={fetchAboutText}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-[#F2FAFB] hover:bg-[#E8F6F8] rounded-2xl text-[#0088A8] font-bold text-[14px] transition-colors cursor-pointer border border-[#E8F6F8] shadow-sm"
                >
                  <Info className="w-5 h-5" />
                  <span>{t("about_olma") || "À propos d'Olma"}</span>
                </button>
                {currentUser && (
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-pink-600 hover:text-pink-700 font-bold text-sm transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-4 h-4 stroke-[2]" />
                    <span>{t("logout") || "Se déconnecter"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10 max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAboutOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-transparent text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors border-none cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
              <div className="mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl justify-center items-center flex bg-sky-50 text-sky-500">
                  <Info className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-semibold text-2xl text-slate-900">{t("about_olma") || "À propos d'Olma"}</h3>
              </div>
              {isLoadingAbout ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-4/6" />
                </div>
              ) : (
                <div className="prose prose-slate prose-sm font-normal text-[15px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {aboutText}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
