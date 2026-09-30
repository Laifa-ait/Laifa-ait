import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  User,
  MapPin,
  Package,
  ShieldCheck,
  Heart,
  Store,
  Star,
  RotateCcw,
  FolderLock,
  Headphones,
  Info,
  ChevronRight,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";
import { UserAvatar } from "../components/ui/UserAvatar";
import { BUYER_ORDERS_PER_PAGE } from "../constants/ui";

// Core Modular Sub-Views
import { ProfileSettings } from "../components/Buyer/ProfileSettings";
import { AddressManager } from "../components/Buyer/AddressManager";
import { SecuritySettings } from "../components/Buyer/SecuritySettings";
import { CustomerPreferences } from "../components/Buyer/CustomerPreferences";
import { GeneralSettings } from "../components/Buyer/GeneralSettings";
import { OrdersSection, BuyerOrder } from "../components/Buyer/OrdersSection";
import { ReturnManagement } from "../components/Buyer/ReturnManagement";
import { MyReviews } from "../components/Buyer/MyReviews";
import { FollowedStores } from "../components/Buyer/FollowedStores";
import { UserDocumentsSection } from "../components/Buyer/UserDocumentsSection";
import { AboutSection } from "../components/Buyer/AboutSection";
import { BuyerSupport } from "./BuyerSupport";

export type SettingTab =
  | "index"
  | "general"
  | "profile"
  | "addresses"
  | "orders"
  | "security"
  | "preferences"
  | "following"
  | "reviews"
  | "returns"
  | "documents"
  | "support"
  | "about";

export const BuyerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();

  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const rawTab = searchParams.get("tab");
  const activeTab: SettingTab =
    rawTab &&
    [
      "general",
      "profile",
      "addresses",
      "orders",
      "security",
      "preferences",
      "following",
      "reviews",
      "returns",
      "documents",
      "support",
      "about",
    ].includes(rawTab)
      ? (rawTab as SettingTab)
      : "index";

  const setActiveTab = (tab: SettingTab) => {
    if (tab === "index") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { replace: true });
      return;
    }

    if (activeTab === "orders" && orders.length === 0) {
      let cancelled = false;
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await apiGet<{ orders: BuyerOrder[]; lastVisible: string | null }>(
            `/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}`
          );
          if (!cancelled && data?.orders) {
            setOrders(data.orders);
            setLastVisible(data.lastVisible);
          }
        } catch (err) {
          if (!cancelled) console.error("Error fetching orders:", err);
        } finally {
          if (!cancelled) setLoadingOrders(false);
        }
      };
      fetchOrders();
      return () => {
        cancelled = true;
      };
    }
  }, [currentUser, activeTab, orders.length, navigate]);

  const loadMoreOrders = async () => {
    if (!currentUser || !lastVisible || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiGet<{ orders: BuyerOrder[]; lastVisible: string | null }>(
        `/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}&startAfter=${lastVisible}`
      );
      if (data?.orders) {
        setOrders((prev) => [...prev, ...data.orders]);
        setLastVisible(data.lastVisible);
      }
    } catch (err) {
      console.error("Error loading more orders:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const settingItems = useMemo(
    () => [
      {
        id: "general" as SettingTab,
        icon: SlidersHorizontal,
        title: t("Général"),
        subtitle: t("Langue, devise DZD, thème et alertes"),
        color: "text-[#1a73e8]",
        bg: "bg-[#e8f0fe]",
      },
      {
        id: "profile" as SettingTab,
        icon: User,
        title: t("Informations personnelles"),
        subtitle: t("Nom, email, numéro de téléphone et photo"),
        color: "text-[#1a73e8]",
        bg: "bg-[#e8f0fe]",
      },
      {
        id: "addresses" as SettingTab,
        icon: MapPin,
        title: t("Adresses et livraisons"),
        subtitle: t("Gestion des adresses dans les 69 wilayas"),
        color: "text-[#1a73e8]",
        bg: "bg-[#e8f0fe]",
      },
      {
        id: "orders" as SettingTab,
        icon: Package,
        title: t("Commandes et achats"),
        subtitle: t("Historique de commandes, factures et suivi"),
        color: "text-[#1a73e8]",
        bg: "bg-[#e8f0fe]",
      },
      {
        id: "security" as SettingTab,
        icon: ShieldCheck,
        title: t("Confidentialité et sécurité"),
        subtitle: t("Mot de passe, double authentification (2FA), sessions"),
        color: "text-[#137333]",
        bg: "bg-[#e6f4ea]",
      },
      {
        id: "preferences" as SettingTab,
        icon: Heart,
        title: t("Préférences d'achat"),
        subtitle: t("Centres d'intérêt et recommandations"),
        color: "text-[#b06000]",
        bg: "bg-[#fef7e0]",
      },
      {
        id: "following" as SettingTab,
        icon: Store,
        title: t("Commerçants favoris"),
        subtitle: t("Boutiques officielles et artisans suivis"),
        color: "text-[#7627bb]",
        bg: "bg-[#f3e8fd]",
      },
      {
        id: "reviews" as SettingTab,
        icon: Star,
        title: t("Avis et évaluations"),
        subtitle: t("Notes et commentaires déposés"),
        color: "text-[#b06000]",
        bg: "bg-[#fef7e0]",
      },
      {
        id: "returns" as SettingTab,
        icon: RotateCcw,
        title: t("Retours et réclamations"),
        subtitle: t("Demandes de retour et échanges avec les vendeurs"),
        color: "text-[#c5221f]",
        bg: "bg-[#fce8e6]",
      },
      {
        id: "documents" as SettingTab,
        icon: FolderLock,
        title: t("Coffre-fort Documents"),
        subtitle: t("Factures certifiées et pièces justificatives"),
        color: "text-[#444746]",
        bg: "bg-[#f0f4f9]",
      },
      {
        id: "support" as SettingTab,
        icon: Headphones,
        title: t("Aide et commentaires"),
        subtitle: t("Assistance client dédiée Olmart"),
        color: "text-[#1a73e8]",
        bg: "bg-[#e8f0fe]",
      },
      {
        id: "about" as SettingTab,
        icon: Info,
        title: t("À propos d'Olmart"),
        subtitle: t("Version 4.6.16 • Conditions d'utilisation • Confidentialité"),
        color: "text-[#444746]",
        bg: "bg-[#f0f4f9]",
      },
    ],
    [t]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return settingItems;
    const q = searchQuery.toLowerCase();
    return settingItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [settingItems, searchQuery]);

  const activeItem = settingItems.find((item) => item.id === activeTab);

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#1f1f1f] pb-16">
      {/* Top Google Settings Bar */}
      <div className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === "index") {
                  navigate("/");
                } else {
                  setActiveTab("index");
                }
              }}
              aria-label={activeTab === "index" ? t("Retour à l'accueil") : t("Retour aux paramètres")}
              title={activeTab === "index" ? t("Retour à l'accueil") : t("Retour")}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#f1f3f4] transition-colors border-none bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-normal text-[#1f1f1f] tracking-tight">
                {activeTab === "index" ? t("Paramètres") : activeItem?.title || t("Paramètres")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser?.photoURL}
              displayName={userProfile?.displayName || currentUser?.displayName}
              email={currentUser?.email}
              providerData={currentUser?.providerData}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* DESKTOP SPLIT VIEW OR MOBILE DRILL-DOWN VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Panel (Visible on Desktop OR on Mobile when activeTab === 'index') */}
          <div
            className={`lg:col-span-4 space-y-4 ${
              activeTab !== "index" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Search Bar inside Settings (Screenshot 2) */}
            <div className="relative">
              <Search className="w-4.5 h-4.5 text-[#444746] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Rechercher dans les paramètres")}
                className="w-full pl-10 pr-9 py-2.5 bg-[#e9eef6] hover:bg-[#dfe4eb] focus:bg-white text-xs sm:text-sm rounded-full border border-transparent focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 outline-none transition-all text-[#1f1f1f] placeholder:text-[#444746]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444746] hover:text-[#1f1f1f] border-none bg-transparent cursor-pointer p-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List of Settings Items (Screenshot 2 Google Material 3 list) */}
            <div className="bg-white rounded-[24px] border border-[#dadce0] overflow-hidden divide-y divide-[#f1f3f4] shadow-xs">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-left rtl:text-right transition-colors cursor-pointer border-none ${
                      isSelected
                        ? "bg-[#e8f0fe] text-[#1a73e8]"
                        : "bg-white hover:bg-[#f8fafd] text-[#1f1f1f]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white text-[#1a73e8] shadow-xs" : `${item.bg} ${item.color}`
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-medium truncate ${
                            isSelected ? "text-[#1a73e8]" : "text-[#1f1f1f]"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#444746] truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 rtl:rotate-180 ${
                        isSelected ? "text-[#1a73e8]" : "text-[#747775]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel (Visible on Desktop always, or on Mobile when a setting tab is selected) */}
          <div
            className={`lg:col-span-8 ${
              activeTab === "index" ? "hidden lg:block" : "block"
            }`}
          >
            {activeTab === "index" ? (
              <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-[24px] border border-[#dadce0] p-8 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[#1f1f1f]">
                  {t("Paramètres du compte Olmart")}
                </h3>
                <p className="text-xs sm:text-sm text-[#444746] max-w-sm mt-1">
                  {t("Sélectionnez une catégorie dans le menu de gauche pour afficher et modifier vos préférences.")}
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-150">
                {activeTab === "general" && <GeneralSettings />}
                {activeTab === "profile" && (
                  <ProfileSettings currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "addresses" && (
                  <AddressManager currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "orders" && (
                  <OrdersSection
                    orders={orders}
                    loading={loadingOrders}
                    loadingMore={loadingMore}
                    hasMore={Boolean(lastVisible)}
                    onLoadMore={loadMoreOrders}
                  />
                )}
                {activeTab === "security" && (
                  <SecuritySettings currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "preferences" && (
                  <CustomerPreferences currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "following" && <FollowedStores />}
                {activeTab === "reviews" && <MyReviews />}
                {activeTab === "returns" && <ReturnManagement currentUser={currentUser} />}
                {activeTab === "documents" && <UserDocumentsSection />}
                {activeTab === "support" && <BuyerSupport />}
                {activeTab === "about" && <AboutSection />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
