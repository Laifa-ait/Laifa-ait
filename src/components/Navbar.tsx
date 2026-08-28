import React, { useState, useEffect } from "react";
import {
  Menu,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { useUI } from "../context/UIContext";
import { Language } from "../domains/home/homepage.types";
import { MegaMenu } from "./MegaMenu";
import { AdvancedSearchbar as Searchbar } from "./Search/AdvancedSearchbar";
import { NotificationCenter } from "./NotificationCenter";

export interface OlmaLogoProps {
  className?: string;
}

export const OlmaLogo: React.FC<OlmaLogoProps> = ({ className }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="60" cy="70" rx="30" ry="34" stroke="currentColor" strokeWidth="8" />
    <path
      d="M60 40C60 40 52 20 60 15C68 20 60 40 60 40Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M55 42C55 42 35 38 40 25C48 25 55 35 55 42Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M65 42C65 42 85 38 80 25C72 25 65 35 65 42Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { cart, wishlist } = useCart();
  const { setSearchQuery, setActiveCategory, setIsSaleFilterActive, setActiveTag } = useShop();
  const { setIsCartOpen, setIsWishlistOpen, setIsMobileMenuOpen } = useUI();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const lang = i18n.language as Language;

  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = React.useRef(0);
  const scrollUpAmount = React.useRef(0);

  const cartCount = React.useMemo(() => cart.reduce((acc, i) => acc + i.quantity, 0), [cart]);

  useEffect(() => {
    let ticking = false;
    lastScrollY.current = window.scrollY;
    scrollUpAmount.current = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show when near the top
          if (currentScrollY < 100) {
            setShowCategories(true);
            scrollUpAmount.current = 0;
          } else {
            const diff = currentScrollY - lastScrollY.current;
            if (diff > 5) {
              // Scrolling down: reset scroll-up accumulator and hide
              scrollUpAmount.current = 0;
              setShowCategories(false);
            } else if (diff < 0) {
              // Scrolling up: accumulate the scroll-up distance
              scrollUpAmount.current += Math.abs(diff);
              // Require at least 150px of deliberate upward scroll to show again
              if (scrollUpAmount.current > 150) {
                setShowCategories(true);
              }
            }
          }

          setIsScrolled(currentScrollY > 20);
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const setLang = (l: string) => {
    i18n.changeLanguage(l);
  };

  const handleLogoClick = () => {
    navigate("/");
    setSearchQuery("");
    setActiveCategory("Tous");
    setIsSaleFilterActive(false);
    setActiveTag(null);
  };

  return (
    <>
      <div
        className="bg-teal-950 text-teal-100/90 text-xs font-medium px-4 sm:px-6 lg:px-12 py-2.5 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide justify-between items-center relative overflow-hidden hidden lg:flex"
      >
        <div className="flex items-center mx-auto w-full max-w-[90rem] justify-between relative z-10">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              {t("trust_delivery")}
            </span>
            <span className="text-teal-800">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              {t("trust_quality")}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (currentUser && userProfile?.role === "seller") {
                  navigate("/dashboard/seller");
                } else if (currentUser) {
                  navigate("/dashboard/buyer");
                } else {
                  navigate("/auth?role=seller");
                }
              }}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-semibold uppercase tracking-wider"
            >
              {t("sell_on_olma")}
            </button>
            <span className="text-teal-800">|</span>
            <button
              onClick={() => navigate("/shipping-calculator")}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-medium"
            >
              {t("shipping_calc") || "Calculateur Livraison"}
            </button>
            <span className="text-teal-800">|</span>
            <button
              onClick={() => navigate("/support")}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none font-medium"
            >
              {t("support") || "Support"}
            </button>
          </div>
        </div>
      </div>

      <nav className={`sticky top-0 z-[100] transition-all duration-300 ${
        location.pathname === "/"
          ? isScrolled
            ? "py-1.5 bg-white border-b-4 border-b-teal-950 shadow-md"
            : "py-3 sm:py-4 bg-transparent border-b border-transparent"
          : "py-2 bg-white border-b-4 border-b-teal-950 shadow-md"
      }`}>
        <div className={`flex flex-col lg:flex-row lg:items-center px-4 sm:px-6 md:px-8 mx-auto w-full max-w-[90rem] justify-between relative gap-3 lg:gap-0 ${
          location.pathname === "/" && showCategories ? "pb-3.5 sm:pb-5" : ""
        }`}>
          
          <div className="flex items-center justify-between w-full lg:w-auto h-12 transition-all duration-300">
            {/* Logo on Left */}
            <div className="flex shrink-0 items-center justify-start lg:w-1/4">
              <button
                 onClick={handleLogoClick}
                 className="flex items-center gap-2 shrink-0 select-none cursor-pointer group bg-transparent border-none"
               >
                 <OlmaLogo className={`text-zinc-900 group-hover:scale-105 transition-all duration-300 ${isScrolled ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'}`} />
                 <span className={`font-display font-bold tracking-tight text-slate-900 uppercase hidden sm:block transition-all duration-300 ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
                   {t("Olma")}
                   <span className="text-zinc-900">{t("rt")}</span>
                 </span>
              </button>
            </div>
            
            {/* Actions for Mobile */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 lg:hidden relative shrink-0">
               <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center text-slate-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer relative bg-transparent border-none w-9 h-9 rounded-full"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none w-9 h-9 rounded-full"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center w-full px-0 lg:px-8 order-last lg:order-none gap-2">
            <div className="w-full max-w-3xl">
              <Searchbar variant="default" />
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-3 sm:gap-5 relative lg:w-1/4 shrink-0">
            <div className="hidden lg:block">
              <NotificationCenter />
            </div>

            {/* Desktop Language Selector */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsLangDropdownOpen(!isLangDropdownOpen);
                  } else if (e.key === "Escape") {
                    setIsLangDropdownOpen(false);
                  }
                }}
                aria-expanded={isLangDropdownOpen}
                aria-haspopup="true"
                aria-label="Changer de langue"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all h-10 px-3 bg-slate-50 rounded-full cursor-pointer"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="uppercase">{lang ? lang.split("-")[0] : "fr"}</span>
              </button>
              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-50 cursor-default" onClick={() => setIsLangDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 shadow-xl z-[60] py-2 rounded-none min-w-[140px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {[
                      { code: "fr", name: "Français" },
                      { code: "ar", name: "العربية" },
                      { code: "en", name: "English" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 hover:bg-transparent ${
                          lang === l.code ? "text-zinc-900" : "text-slate-700"
                        }`}
                      >
                        <span>{l.name}</span>
                        {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hidden lg:flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer relative bg-slate-50 w-10 h-10 rounded-full"
            >
              <Heart className="w-5 h-5 stroke-[1.5] text-slate-500" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Panier */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer relative bg-slate-50 w-10 h-10 rounded-full"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5] text-slate-500" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown Toggle */}
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                } else if (e.key === "Escape") {
                  setIsUserDropdownOpen(false);
                }
              }}
              aria-expanded={isUserDropdownOpen}
              aria-haspopup="true"
              aria-label="Menu utilisateur"
              className="flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer bg-slate-50 w-10 h-10 rounded-full"
            >
              <UserIcon className="w-5 h-5 stroke-[1.5] text-slate-500" />
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsUserDropdownOpen(false)} />
                <div className="absolute top-full right-0 mt-4 bg-white border border-slate-100 shadow-xl rounded-none z-[70] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 min-w-[260px]">
                  {!currentUser ? (
                    <div className="p-4 bg-transparent">
                      <button
                        onClick={() => {
                          navigate("/auth", { replace: true });
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full py-3 bg-zinc-900 text-white rounded-none font-semibold text-sm hover:bg-zinc-900 transition-colors border-none cursor-pointer"
                      >
                        {t("auth.signin") || "Se connecter"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-5 border-b border-slate-100 flex flex-col gap-1 bg-transparent">
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <span className="truncate">{userProfile?.displayName || currentUser.email}</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {userProfile?.role === "admin"
                            ? t("role_admin") || "Administrateur"
                            : userProfile?.role === "seller"
                              ? t("role_seller") || "Vendeur"
                              : t("role_client") || "Client"}
                        </p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/dashboard/buyer");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-5 py-3 text-sm font-medium text-slate-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {t("buyer_space") || "Mon Espace"}
                        </button>

                        {userProfile?.role === "seller" && (
                          <button
                            onClick={() => {
                              navigate("/dashboard/seller");
                              setIsUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-5 py-3 text-sm font-medium text-slate-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            {t("seller_dashboard") || "Dashboard Vendeur"}
                          </button>
                        )}

                        {userProfile?.role === "admin" && (
                          <button
                            onClick={() => {
                              navigate("/dashboard/admin");
                              setIsUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-5 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                          >
                            {t("administration") || "Administration"}
                          </button>
                        )}
                      </div>

                      <div className="p-2 border-t border-slate-100 bg-transparent">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {t("auth.logout") || "Déconnexion"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* PC Version Hamburger / Sandwich Menu on the Right */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="hidden lg:flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all cursor-pointer bg-slate-50 w-10 h-10 rounded-full shrink-0"
              title={t("menu") || "Menu"}
            >
              <Menu className="w-5 h-5 stroke-[1.5] text-slate-500" />
            </button>
          </div>
        </div>
        {location.pathname === "/" && <MegaMenu isVisible={showCategories} />}
      </nav>
    </>
  );
};
