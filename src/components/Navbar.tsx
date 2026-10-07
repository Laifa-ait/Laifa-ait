import React, { useState, useEffect } from "react";
import {
  Menu,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Globe,
  Wrench,
  Building2,
  Store,
  Scale,
  Truck,
  Headphones,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { useUI } from "../context/UIContext";
import { Language } from "../domains/home/homepage.types";
import { MegaMenu } from "./MegaMenu";
import { AdvancedSearchbar as Searchbar } from "./Search/AdvancedSearchbar";
import { NotificationCenter } from "./NotificationCenter";
import { SuperAppSwitcherModal } from "./common/SuperAppSwitcherModal";
import { UserAvatar } from "./ui/UserAvatar";

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
  const { currentUser, userProfile } = useAuth();
  const { cart, wishlist } = useCart();
  const { setSearchQuery, setActiveCategory, setIsSaleFilterActive, setActiveTag } = useShop();
  const { setIsCartOpen, setIsWishlistOpen, setIsMobileMenuOpen, setIsAccountMenuOpen } = useUI();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isCategoriesPage = location.pathname === "/categories";
  const isProductPage = location.pathname.startsWith("/product/");

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
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
        id="olmart-top-utility-bar"
        className="bg-slate-900 text-slate-300 text-xs font-medium px-4 sm:px-6 lg:px-12 py-2 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide justify-between items-center relative hidden lg:flex border-b border-slate-800"
      >
        <div className="flex items-center mx-auto w-full max-w-[90rem] justify-between relative z-10">
          {/* Universes Navigation Hub */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(true)}
              className="px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer group shadow-xs mr-1"
              title={t("Ouvrir le commutateur d'univers Olmart Super-App", "Ouvrir le commutateur d'univers Olmart Super-App")}
            >
              <LayoutGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-emerald-400" />
              <span>{t("Univers", "Univers")}</span>
            </button>

            <Link
              to="/shop"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === "/" || location.pathname.startsWith("/shop")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t("Marketplace", "Marketplace")}</span>
            </Link>

            <Link
              to="/bricolage"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith("/bricolage")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("Olma Bricolage", "Olma Bricolage")}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                {t("Artisans", "Artisans")}
              </span>
            </Link>

            <Link
              to="/immo"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith("/immo")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("Olma Immo", "Olma Immo")}</span>
            </Link>

            <Link
              to="/shops"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith("/shops")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("Boutiques", "Boutiques")}</span>
            </Link>

            <Link
              to="/comparator"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith("/comparator")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("Comparateur", "Comparateur")}</span>
            </Link>
          </div>

          {/* Quick Tools & Seller CTA */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              to="/shipping-calculator"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("shipping_calc") || "Tarifs Livraison 69 Wilayas"}</span>
            </Link>

            <span className="text-slate-700">|</span>

            <Link
              to="/support"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("support") || "Aide & Support"}</span>
            </Link>

            <span className="text-slate-700">|</span>

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
              className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-xs cursor-pointer border-none uppercase tracking-wider text-[11px]"
            >
              {t("sell_on_olma")}
            </button>
          </div>
        </div>
      </div>

      <nav className={`${
        isProductPage
          ? "sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
          : `sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 transition-shadow duration-200 ${
              isScrolled ? "shadow-[0_4px_20px_rgba(15,23,42,0.06)]" : "shadow-xs"
            }`
      } py-2 sm:py-2.5`}>
        {/* On mobile for Product Details: Dedicated sticky search bar with back button */}
        {isProductPage && (
          <div className="flex lg:hidden items-center justify-between w-full gap-2.5 h-11 px-3 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/shop");
                }
              }}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer border border-slate-200 shadow-xs transition-all active:scale-95"
              aria-label="Retour"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>

            <div className="flex-1 min-w-0">
              <Searchbar variant="transparent" />
            </div>
          </div>
        )}

        <div className={`${isProductPage ? "hidden lg:flex" : "flex"} flex-col lg:flex-row lg:items-center px-4 sm:px-6 md:px-8 mx-auto w-full max-w-[90rem] justify-between relative gap-2 sm:gap-3 lg:gap-0 ${
          location.pathname === "/" && showCategories ? "pb-2 sm:pb-3" : ""
        }`}>
          
          <div className="flex items-center justify-between w-full lg:w-auto h-11 sm:h-12">
            {/* Logo on Left */}
            <div className="flex shrink-0 items-center justify-start lg:w-1/4">
              <button
                 onClick={handleLogoClick}
                 className="flex items-center gap-2 shrink-0 select-none cursor-pointer group bg-transparent border-none"
               >
                 <OlmaLogo className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 group-hover:scale-105 transition-transform duration-200" />
                 <span className="font-display font-bold tracking-tight text-slate-900 uppercase hidden sm:block text-2xl sm:text-3xl">
                   {t("Olma")}
                   <span className="text-emerald-600">{t("rt")}</span>
                 </span>
              </button>
            </div>
            
             {/* Actions for Mobile */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:hidden relative shrink-0">
               <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={t("Mon Panier") || "Mon Panier"}
                className="flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-all cursor-pointer relative bg-transparent border-none w-10 h-10 rounded-full active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label={t("Menu") || "Menu"}
                className="flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-all cursor-pointer bg-transparent border-none w-10 h-10 rounded-full active:scale-95"
              >
                <Menu className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>

          {!isCategoriesPage && (
            <div className={`flex-1 flex items-center justify-center w-full px-0 ${isProductPage ? "lg:px-12 max-w-2xl" : "lg:px-8 max-w-3xl"} order-last lg:order-none gap-2`}>
              <div className="w-full">
                <Searchbar variant={isProductPage ? "discreet" : "default"} />
              </div>
            </div>
          )}

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
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-all h-10 px-3 bg-slate-50 rounded-full cursor-pointer"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="uppercase">{lang ? lang.split("-")[0] : "fr"}</span>
              </button>
              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-50 cursor-default" onClick={() => setIsLangDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 shadow-xl z-[60] py-2 rounded-2xl min-w-[140px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
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
                        className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 hover:bg-slate-50 ${
                          lang === l.code ? "text-emerald-700 font-bold" : "text-slate-600"
                        }`}
                      >
                        <span>{l.name}</span>
                        {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hidden lg:flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer relative bg-slate-50 w-10 h-10 rounded-full"
            >
              <Heart className="w-5 h-5 stroke-[1.5] text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Panier */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={t("Mon Panier") || "Mon Panier"}
              className="flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer relative bg-slate-50 w-10 h-10 rounded-full active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8] text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Google Account Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!currentUser) {
                    navigate("/auth", { replace: true });
                  } else {
                    setIsAccountMenuOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!currentUser) {
                      navigate("/auth", { replace: true });
                    } else {
                      setIsAccountMenuOpen(true);
                    }
                  }
                }}
                aria-haspopup="true"
                aria-label="Compte utilisateur"
                className={`flex items-center justify-center transition-all cursor-pointer w-10 h-10 rounded-full border ${
                  currentUser
                    ? "p-0.5 border-slate-300 hover:ring-2 hover:ring-emerald-500/30 hover:border-emerald-600 bg-white"
                    : "text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border-slate-200 bg-slate-50"
                }`}
              >
                {currentUser ? (
                  <UserAvatar
                    photoURL={userProfile?.photoURL || currentUser.photoURL}
                    displayName={userProfile?.displayName || currentUser.displayName}
                    email={currentUser.email}
                    providerData={currentUser.providerData}
                    size="sm"
                    alt={userProfile?.displayName || "Profil"}
                  />
                ) : (
                  <UserIcon className="w-5 h-5 stroke-[1.5] text-slate-600" />
                )}
              </button>
            </div>

            {/* PC Version Hamburger / Sandwich Menu on the Right */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="hidden lg:flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer bg-slate-50 w-10 h-10 rounded-full shrink-0"
              title={t("menu") || "Menu"}
            >
              <Menu className="w-5 h-5 stroke-[1.5] text-slate-600" />
            </button>
          </div>
        </div>

        {location.pathname === "/" && <MegaMenu isVisible={showCategories} />}
      </nav>

      {/* Super-App Switcher Modal */}
      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
