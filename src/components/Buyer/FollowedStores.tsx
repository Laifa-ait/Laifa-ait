import React, { useState, useEffect, useMemo } from "react";
import { Store, Sparkles, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { apiGet, apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Product } from "../../domains/product/product.types";
import { StoreCard, StoreCardData } from "./stores/StoreCard";
import { WilayaFilterBar } from "./stores/WilayaFilterBar";
import { getRetroAvatar } from "../../utils/avatar";

export interface FollowedStoreRaw {
  sellerId?: string;
  id?: string;
  name?: string;
  shopName?: string;
  logo?: string | null;
  logoUrl?: string | null;
  photoURL?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  shopLogo?: string | null;
  location?: string;
  wilaya?: string;
  shopDescription?: string;
  description?: string;
}

const POPULAR_WILAYAS = [
  "Toutes",
  "16 Alger",
  "31 Oran",
  "25 Constantine",
  "09 Blida",
  "15 Tizi Ouzou",
  "19 Sétif",
  "08 Béchar",
];

const extractStoreLogo = (s: FollowedStoreRaw): string => {
  const candidate = s.logoUrl || s.photoURL || s.logo || s.avatar || s.avatarUrl || s.shopLogo;
  if (candidate && typeof candidate === "string" && candidate.trim() && !candidate.startsWith("data:")) {
    return candidate.trim();
  }
  return getRetroAvatar(s.shopName || s.name || s.sellerId || s.id || "store");
};

export const FollowedStores: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [followedStores, setFollowedStores] = useState<StoreCardData[]>([]);
  const [exploreStores, setExploreStores] = useState<StoreCardData[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"followed" | "explore">("followed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("Toutes");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const resFollowed = await apiGet<{ stores: FollowedStoreRaw[] }>(
            "/api/v1/buyer/followed-stores"
          );
          if (!cancelled && resFollowed?.stores) {
            const mapped: StoreCardData[] = resFollowed.stores.map((s) => ({
              id: s.id || s.sellerId || "",
              sellerId: s.sellerId || s.id || "",
              name: s.shopName || s.name || "Boutique Partenaire",
              logo: extractStoreLogo(s),
              location: s.wilaya || s.location || "Algérie",
              description: s.shopDescription || s.description || "",
              isFollowed: true,
            }));
            setFollowedStores(mapped);
            if (mapped.length === 0) setActiveTab("explore");
          }
        }

        const resExplore = await apiGet<{ sellers: FollowedStoreRaw[] }>("/api/v1/explore/sellers");
        if (!cancelled && resExplore?.sellers) {
          const mappedExplore: StoreCardData[] = resExplore.sellers.map((s) => ({
            id: s.id || s.sellerId || "",
            sellerId: s.sellerId || s.id || "",
            name: s.shopName || s.name || "Boutique Partenaire",
            logo: extractStoreLogo(s),
            location: s.wilaya || s.location || "Algérie",
            description: s.shopDescription || s.description || "",
            isFollowed: false,
          }));
          setExploreStores(mappedExplore);
        }

        const resProds = await apiGet<{ products: Product[] }>("/api/v1/explore/products");
        if (!cancelled && resProds?.products) {
          const pMap: Record<string, Product[]> = {};
          resProds.products.forEach((p) => {
            if (p.sellerId) {
              if (!pMap[p.sellerId]) pMap[p.sellerId] = [];
              if (pMap[p.sellerId].length < 3) pMap[p.sellerId].push(p);
            }
          });
          setProductsMap(pMap);
        }
      } catch (err) {
        if (!cancelled) console.error("Error loading stores data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const handleToggleFollow = async (store: StoreCardData) => {
    if (!currentUser) return toast.error(t("Veuillez vous connecter."));
    const sid = store.sellerId || store.id;
    setActionLoadingId(sid);

    try {
      if (store.isFollowed) {
        await apiPost("/api/v1/buyer/unfollow", { sellerId: sid });
        setFollowedStores((prev) => prev.filter((s) => s.sellerId !== sid && s.id !== sid));
        setExploreStores((prev) =>
          prev.map((s) => (s.sellerId === sid || s.id === sid ? { ...s, isFollowed: false } : s))
        );
        toast.success(t("Désabonnement réussi."));
      } else {
        await apiPost("/api/v1/buyer/follow", { sellerId: sid });
        const updated = { ...store, isFollowed: true };
        setFollowedStores((prev) => [...prev, updated]);
        setExploreStores((prev) =>
          prev.map((s) => (s.sellerId === sid || s.id === sid ? { ...s, isFollowed: true } : s))
        );
        toast.success(t("Vous suivez désormais cette boutique !"));
      }
    } catch (err) {
      console.error("Toggle follow failed:", err);
      toast.error(t("Une erreur est survenue."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList = activeTab === "followed" ? followedStores : exploreStores;

  const filteredStores = useMemo(() => {
    return currentList.filter((s) => {
      const matchQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchWilaya =
        selectedWilaya === "Toutes" ||
        (s.location && s.location.toLowerCase().includes(selectedWilaya.toLowerCase()));

      return matchQuery && matchWilaya;
    });
  }, [currentList, searchQuery, selectedWilaya]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="followed-stores-module">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          {t("Commerçants favoris")}
        </h2>
        <p className="text-[#5f6368] text-sm mt-1">
          {t("Suivez vos boutiques et artisans favoris dans les 69 wilayas d'Algérie.")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#f0f4f9] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("followed")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none ${
            activeTab === "followed"
              ? "bg-white text-[#1a73e8] shadow-xs"
              : "text-[#5f6368] hover:text-[#202124] bg-transparent"
          }`}
        >
          {t("Mes abonnements ({{count}})", { count: followedStores.length })}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none ${
            activeTab === "explore"
              ? "bg-white text-[#1a73e8] shadow-xs"
              : "text-[#5f6368] hover:text-[#202124] bg-transparent"
          }`}
        >
          {t("Découvrir les boutiques")}
        </button>
      </div>

      {/* Wilaya Filter Bar */}
      <WilayaFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedWilaya={selectedWilaya}
        onWilayaSelect={setSelectedWilaya}
        popularWilayas={POPULAR_WILAYAS}
      />

      {/* Store Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-[24px] border border-[#dadce0]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1a73e8]" />
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="bg-white border border-[#dadce0] rounded-[28px] p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-[#202124]">
              {activeTab === "followed"
                ? t("Aucune boutique suivie pour le moment")
                : t("Aucune boutique trouvée")}
            </h3>
            <p className="text-xs text-[#5f6368]">
              {activeTab === "followed"
                ? t("Explorez nos boutiques certifiées et artisans partenaires dans les 69 wilayas.")
                : t("Essayez un autre mot-clé ou modifiez le filtre de wilaya.")}
            </p>
          </div>
          {activeTab === "followed" && (
            <button
              type="button"
              onClick={() => setActiveTab("explore")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium rounded-full transition-colors cursor-pointer border-none"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("Découvrir les boutiques")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              products={productsMap[store.sellerId || store.id] || []}
              isLoadingAction={actionLoadingId === (store.sellerId || store.id)}
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
