/* eslint-disable max-lines */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OlmaLogo } from "./Navbar";
import toast from "react-hot-toast";
import { subscribeToNewsletter } from "../services/newsletterService";
import { QRCodeSVG } from "qrcode.react";
import {
  Store,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { BrandIcon } from "./ui/BrandIcon";
import { safeLogger } from "../utils/logger";

export const Footer: React.FC<{ isHomepage?: boolean }> = ({ isHomepage = false }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");

  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/v1/public/settings");
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          if (!cancelled && data.supportEmail) {
            setSupportEmail(data.supportEmail);
          }
        }
      } catch (error) {
        if (!cancelled) safeLogger.error("Error fetching support email", { err: error instanceof Error ? error.message : String(error) });
      }
    };
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error(
        t("Veuillez vous connecter pour vous inscrire à la newsletter.") ||
          "Veuillez vous connecter pour vous inscrire à la newsletter."
      );
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      toast.error(t("invalid_email") || "Veuillez entrer un email valide");
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      toast.success(t("newsletter_success") || "Inscription réussie aux alertes Olmart !");
      setEmail("");
    } catch (error: unknown) {
      safeLogger.error("Erreur lors de l'inscription à la newsletter", { err: error instanceof Error ? error.message : String(error) });
      if (error instanceof Error && error.message === "ALREADY_SUBSCRIBED") {
        toast.error(t("already_subscribed") || "Vous êtes déjà inscrit !");
      } else {
        toast.error(t("error_try_later") || "Erreur, veuillez réessayer ultérieurement");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="olmart-main-footer"
      className={`custom-dark-footer bg-slate-950 text-slate-400 border-t border-slate-900 ${
        isHomepage ? "pb-24 sm:pb-12" : "pb-12"
      }`}
    >
      {/* Main Marketplace Links & Navigation Grid */}
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
        {/* Column 1: Marketplace Brand Identity & Social Icons */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5">
            <OlmaLogo className="w-8 h-8 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-sans">
                {isArabic ? "أولمارت" : "OLMA"}
                {!isArabic && <span className="text-orange-500">RT</span>}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400">
                {t("footer_marketplace_subtitle") || "Premier Marketplace Algérien"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            {t(
              "footer_marketplace_desc",
              "La plateforme multi-vendeurs N°1 en Algérie. Découvrez des milliers de produits proposés par des commerçants indépendants certifiés dans les 58 Wilayas."
            )}
          </p>

          {/* Social Network Brand Icons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              {t("footer_follow_us") || "Suivez-nous sur les réseaux"}
            </span>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com/olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600/20 text-slate-400 hover:text-blue-500 border border-slate-800 hover:border-blue-500/40 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="facebook" size={16} />
              </a>
              <a
                href="https://instagram.com/olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600/20 text-slate-400 hover:text-pink-500 border border-slate-800 hover:border-pink-500/40 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="instagram" size={16} />
              </a>
              <a
                href="https://tiktok.com/@olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="tiktok" size={16} />
              </a>
              <a
                href="https://youtube.com/@olmart"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600/20 text-slate-400 hover:text-red-500 border border-slate-800 hover:border-red-500/40 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="youtube" size={16} />
              </a>
              <a
                href="https://linkedin.com/company/olmart"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-sky-600/20 text-slate-400 hover:text-sky-400 border border-slate-800 hover:border-sky-500/40 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="linkedin" size={16} />
              </a>
              <a
                href="https://x.com/olmart_dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="x" size={15} />
              </a>
              <a
                href="https://wa.me/213550000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Support Olmart"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-center transition-all duration-200"
              >
                <BrandIcon name="whatsapp" size={16} />
              </a>
            </div>
          </div>

          {/* Seller CTA Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4 text-orange-400" />
              <span>{t("footer_are_you_merchant") || "Vous êtes commerçant ?"}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {t(
                "footer_open_store_desc",
                "Ouvrez votre boutique en ligne et vendez vos produits à des millions d'Algériens."
              )}
            </p>
            <button
              onClick={() => navigate("/seller-onboarding")}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-none"
            >
              <span>{t("footer_become_seller_btn") || "Devenir Vendeur Olmart"}</span>
              {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Column 2: Acheteurs & Shopping */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <span>{t("footer_buyers_heading") || "Acheteurs"}</span>
          </h5>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li>
              <button
                onClick={() => navigate("/shop")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <span>{t("footer_all_products") || "Tous les produits"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shops")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <span>{t("footer_shops_directory") || "Annuaire des Boutiques"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shipping-calculator")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <span>{t("footer_shipping_calc_link") || "Calculateur de frais de livraison"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/buyer/orders")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <span>{t("footer_my_orders") || "Mes Commandes & Historique"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/refund-policy")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <span>{t("footer_returns_guarantees") || "Retours & Garanties"}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Newsletter & Mobile App */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>{t("footer_offers_app_heading") || "Offres & Application"}</span>
          </h5>

          {/* Newsletter Form */}
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 leading-normal">
              {t(
                "footer_newsletter_promo_desc",
                "Recevez les meilleures promos des vendeurs Olmart chaque semaine."
              )}
            </p>
            <form className="flex flex-col gap-2" onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer_email_placeholder") || "Votre adresse email"}
                  className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all border border-slate-700 shadow-sm cursor-pointer"
              >
                {isSubmitting
                  ? t("footer_subscribing_btn") || "Inscription..."
                  : t("footer_subscribe_btn") || "S'inscrire aux offres"}
              </button>
            </form>
          </div>

          {/* App QR & Badges */}
          <div className="pt-2 border-t border-slate-900 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                <QRCodeSVG value="https://olmart.dz" size={40} level="M" />
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                <p className="font-bold text-white uppercase">
                  {t("footer_app_title") || "App Mobile Olmart"}
                </p>
                <p>{t("footer_app_scan") || "Scannez pour commander plus vite"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal, Payment & Partner Badges */}
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-8 border-t border-slate-900/90 flex flex-col lg:flex-row justify-between items-center gap-6 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
          <span className="font-medium">
            © {new Date().getFullYear()}{" "}
            {t("footer_copyright") || "Olmart Marketplace Algérie. Tous droits réservés."}
          </span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-olma-updates"))}
            className="text-[10px] text-orange-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            {t("footer_updates_log") || "Journal des mises à jour"}
          </button>
        </div>

        {/* Secure Payments & Partner Badges with Official Brand Logos */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 me-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            {t("footer_payment_delivery_label") || "Paiements Sécurisés & Livraison"} :
          </span>
          
          {/* CIB Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-emerald-400 font-bold text-[10px]">
            <CreditCard className="w-3 h-3 text-emerald-400" />
            {t("CIB")}
          </span>

          {/* BaridiMob Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-amber-400 font-bold text-[10px]">
            {t("BaridiMob")}
          </span>

          {/* Visa Brand Icon */}
          <span
            className="inline-flex items-center px-2 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300"
            title="Visa"
          >
            <BrandIcon name="visa" size={22} className="text-[#1A1F71] dark:text-[#00579F]" />
          </span>

          {/* Mastercard Brand Icon */}
          <span
            className="inline-flex items-center px-2 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300"
            title="Mastercard"
          >
            <BrandIcon name="mastercard" size={20} className="text-[#EB001B]" />
          </span>

          {/* Cash on Delivery Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-orange-400 font-bold text-[10px]">
            <Truck className="w-3 h-3 text-orange-400" />
            {t("footer_cod_badge") || "Paiement à la livraison (COD)"}
          </span>

          {/* Yalidine Logistics Badge */}
          <span className="px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-medium text-[10px]">
            {t("Yalidine Express")}
          </span>

          {/* ZR Logistics Badge */}
          <span className="px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 font-medium text-[10px]">
            {t("ZR Express")}
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-medium">
          <button
            onClick={() => navigate("/privacy-policy")}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            {t("footer_privacy") || "Confidentialité"}
          </button>
          <span>•</span>
          <button
            onClick={() => navigate("/refund-policy")}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            {t("footer_returns") || "Retours"}
          </button>
          <span>•</span>
          <button
            onClick={() => navigate("/support")}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            {t("footer_support") || "Support"}
          </button>
          {supportEmail && (
            <>
              <span>•</span>
              <span className="text-slate-400 font-mono text-[10px]">{supportEmail}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};


