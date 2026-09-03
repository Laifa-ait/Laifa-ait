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
  CreditCard,
  Headphones,
  RotateCcw,
  Mail,
  ArrowRight
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
      className={`bg-zinc-950 text-zinc-300 border-t border-zinc-800/80 ${
        isHomepage ? "pb-24 sm:pb-12" : "pb-12"
      }`}
    >
      {/* 1. Value Proposition & Trust Bar (Amazon / Zalando style reassurance) */}
      <div className="border-b border-zinc-800/60 bg-zinc-900/40">
        <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {t("footer_trust_delivery_title") || "Livraison 58 Wilayas"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t("footer_trust_delivery_sub") || "À domicile ou en point relais"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {t("footer_trust_security_title") || "Paiement 100% Sécurisé"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t("footer_trust_security_sub") || "CIB, BaridiMob & Main à main"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {t("footer_trust_guarantee_title") || "Garantie & Retours"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t("footer_trust_guarantee_sub") || "Protection acheteur Olmart"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {t("footer_trust_support_title") || "Support Client 7j/7"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t("footer_trust_support_sub") || "Équipe dédiée à votre écoute"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Columns Grid */}
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-12 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Column 1: Brand & Vendeur Callout (Span 4) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <OlmaLogo className="w-9 h-9 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-sans">
                {isArabic ? "أولمارت" : "OLMA"}
                {!isArabic && <span className="text-amber-500">RT</span>}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                {t("footer_marketplace_subtitle") || "Premier Marketplace Algérien"}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
            {t(
              "footer_marketplace_desc",
              "La plateforme e-commerce multi-vendeurs de référence en Algérie. Découvrez des milliers de produits certifiés auprès de marchands indépendants répartis sur les 58 Wilayas."
            )}
          </p>

          {/* Social Icons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
              {t("footer_follow_us") || "Suivez Olmart"}
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href="https://facebook.com/olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-blue-600/20 text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-500/40 flex items-center justify-center transition-all"
              >
                <BrandIcon name="facebook" size={16} />
              </a>
              <a
                href="https://instagram.com/olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-pink-600/20 text-zinc-400 hover:text-pink-400 border border-zinc-800 hover:border-pink-500/40 flex items-center justify-center transition-all"
              >
                <BrandIcon name="instagram" size={16} />
              </a>
              <a
                href="https://tiktok.com/@olmart.dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <BrandIcon name="tiktok" size={16} />
              </a>
              <a
                href="https://youtube.com/@olmart"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/40 flex items-center justify-center transition-all"
              >
                <BrandIcon name="youtube" size={16} />
              </a>
              <a
                href="https://linkedin.com/company/olmart"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-sky-600/20 text-zinc-400 hover:text-sky-400 border border-zinc-800 hover:border-sky-500/40 flex items-center justify-center transition-all"
              >
                <BrandIcon name="linkedin" size={16} />
              </a>
              <a
                href="https://x.com/olmart_dz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <BrandIcon name="x" size={15} />
              </a>
              <a
                href="https://wa.me/213550000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Support Olmart"
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-emerald-600/20 text-zinc-400 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 flex items-center justify-center transition-all"
              >
                <BrandIcon name="whatsapp" size={16} />
              </a>
            </div>
          </div>

          {/* Seller Card Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-zinc-900 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4 text-amber-400" />
              <span>{t("footer_are_you_merchant") || "Vous êtes commerçant ?"}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              {t(
                "footer_open_store_desc",
                "Rejoignez le réseau Olmart et développez votre activité dans tout le pays avec des outils de vente puissants."
              )}
            </p>
            <button
              onClick={() => navigate("/seller-onboarding")}
              className="mt-1 inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border-none"
            >
              <span>{t("footer_become_seller_btn") || "Ouvrir ma boutique"}</span>
              {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Column 2: Acheteurs & Shopping (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800/80 pb-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>{t("footer_buyers_heading") || "Acheteurs"}</span>
          </h5>
          <ul className="space-y-2 text-xs text-zinc-400 font-medium">
            <li>
              <button
                onClick={() => navigate("/shop")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_all_products") || "Catalogue général"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shops")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_shops_directory") || "Boutiques certifiées"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shipping-calculator")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_shipping_calc_link") || "Frais de livraison"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/buyer/orders")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_my_orders") || "Suivre ma commande"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/refund-policy")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_returns_guarantees") || "Garanties & Retours"}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Aide & Légal (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800/80 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t("footer_help_legal_heading") || "Aide & Sécurité"}</span>
          </h5>
          <ul className="space-y-2 text-xs text-zinc-400 font-medium">
            <li>
              <button
                onClick={() => navigate("/support")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_support") || "Centre d'assistance"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/privacy-policy")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_privacy") || "Protection des données"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/terms-of-service")}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_terms") || "Conditions d'utilisation"}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-olma-updates"))}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span>{t("footer_updates_log") || "Nouveautés & Mises à jour"}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Mobile App (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border-b border-zinc-800/80 pb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t("footer_offers_app_heading") || "Restez Informé"}</span>
          </h5>

          {/* Newsletter Form */}
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-400 leading-normal">
              {t(
                "footer_newsletter_promo_desc",
                "Recevez nos alertes bons plans et promotions exclusives chaque semaine."
              )}
            </p>
            <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer_email_placeholder") || "Votre email..."}
                  className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3.5 py-2.5 text-xs text-white rounded-2xl focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all border-none shadow-sm cursor-pointer shrink-0 active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting ? (
                  <span>...</span>
                ) : (
                  <>
                    <span>{t("footer_subscribe_btn") || "OK"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mobile QR Box */}
          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-md">
              <QRCodeSVG value="https://olmart.dz" size={40} level="M" />
            </div>
            <div className="text-[11px] text-zinc-400 leading-tight">
              <p className="font-bold text-white text-xs">
                {t("footer_app_title") || "Application Olmart"}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {t("footer_app_scan") || "Scannez pour commander sur mobile"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal, Payment & Partner Badges */}
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-6 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-center md:text-start">
          <span className="font-medium text-[11px]">
            © {new Date().getFullYear()}{" "}
            {t("footer_copyright") || "Olmart Marketplace Algérie. Tous droits réservés."}
          </span>
          {supportEmail && (
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              • {supportEmail}
            </span>
          )}
        </div>

        {/* Secure Payments & Logistics Partners */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* CIB Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 font-bold text-[10px]">
            <CreditCard className="w-3 h-3 text-emerald-400" />
            CIB
          </span>

          {/* BaridiMob Badge */}
          <span className="inline-flex items-center px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-400 font-bold text-[10px]">
            BaridiMob
          </span>

          {/* Visa */}
          <span
            className="inline-flex items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg"
            title="Visa"
          >
            <BrandIcon name="visa" size={20} className="text-[#1A1F71] dark:text-[#00579F]" />
          </span>

          {/* Mastercard */}
          <span
            className="inline-flex items-center px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg"
            title="Mastercard"
          >
            <BrandIcon name="mastercard" size={18} className="text-[#EB001B]" />
          </span>

          {/* Cash on Delivery */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium text-[10px]">
            <Truck className="w-3 h-3 text-amber-500" />
            COD (Cash)
          </span>

          {/* Yalidine */}
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium text-[10px]">
            Yalidine Express
          </span>

          {/* ZR */}
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium text-[10px]">
            ZR Express
          </span>
        </div>
      </div>
    </footer>
  );
};



