import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Search, Zap, CheckCircle2, Clock } from "lucide-react";
import { apiGet, apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Product } from "../../domains/product/product.types";
import { toast } from "react-hot-toast";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import { SponsorshipAnalyticsHeader } from "../../components/Seller/Sponsorship/SponsorshipAnalyticsHeader";
import { SponsorshipPackSelectorModal } from "../../components/Seller/Sponsorship/SponsorshipPackSelectorModal";
import { SponsorshipHistoryList } from "../../components/Seller/Sponsorship/SponsorshipHistoryList";
import { SponsorshipGuideSection } from "../../components/Seller/Sponsorship/SponsorshipGuideSection";
import { SponsorshipPackConfig, SponsorshipTier, SponsorshipAnalyticsSummary, SponsorshipRequest, DEFAULT_SPONSORSHIP_PACKS } from "../../domains/seller/sponsorship.types";

export const SellerSponsorships: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);
  const [packs, setPacks] = useState<Record<SponsorshipTier, SponsorshipPackConfig>>(DEFAULT_SPONSORSHIP_PACKS);
  const [analyticsSummary, setAnalyticsSummary] = useState<SponsorshipAnalyticsSummary>({
    totalImpressions: 0,
    totalClicks: 0,
    avgCtr: 0,
    totalSales: 0,
    totalRevenue: 0,
    activeSponsorshipsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductForPack, setSelectedProductForPack] = useState<Product | null>(null);

  const fetchSponsorshipData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await apiGet<{
        products: Product[];
        sponsorshipRequests: SponsorshipRequest[];
        packs: Record<SponsorshipTier, SponsorshipPackConfig>;
        analyticsSummary: SponsorshipAnalyticsSummary;
      }>("/api/v1/seller/sponsorships");

      if (data) {
        setProducts(data.products || []);
        setSponsorshipRequests(data.sponsorshipRequests || []);
        if (data.packs) setPacks(data.packs);
        if (data.analyticsSummary) setAnalyticsSummary(data.analyticsSummary);
      }
    } catch (error) {
      console.error("Error fetching sponsorship data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorshipData();
  }, [currentUser]);

  const handleOpenPackModal = (product: Product) => {
    if (product.status !== "active") {
      toast.error(t("Seuls les produits approuvés peuvent être sponsorisés"));
      return;
    }
    setSelectedProductForPack(product);
  };

  const handlePackSubmit = async (payload: {
    productId: string;
    tier: SponsorshipTier;
    durationDays: number;
  }) => {
    try {
      const res = await apiPost<{ success: boolean; message: string; autoApproved?: boolean }>(
        "/api/v1/seller/sponsorships",
        payload
      );

      if (res?.success) {
        toast.success(res.message);
        await fetchSponsorshipData();
      }
    } catch (error: any) {
      toast.error(error.message || t("Erreur lors de la réservation du pack."));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-3 font-sans">
            <Megaphone className="w-8 h-8 text-orange-500" />
            {t("Sponsoring & Visibilité")}
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-1 font-sans">
            {t("Boostez vos ventes avec les Packs Bronze, Silver et Gold et suivez votre CTR.")}
          </p>
        </div>
      </div>

      {/* KPI Analytics Header */}
      <SponsorshipAnalyticsHeader summary={analyticsSummary} />

      {/* Guide Section */}
      <SponsorshipGuideSection />

      {/* Product Catalog Selector */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-wide font-sans">
              {t("Choisir un produit à sponsoriser")}
            </h3>
            <p className="text-xs text-zinc-500">
              {t("Sélectionnez un article de votre catalogue pour lui appliquer un Pack Sponsoring.")}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:border-orange-500 transition-colors"
              placeholder={t("Rechercher dans votre catalogue...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-zinc-100 rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 font-bold uppercase tracking-wider text-xs">
            {t("Aucun produit trouvé.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const productRequests = sponsorshipRequests.filter((r) => r.productId === product.id);
              const pendingRequest = productRequests.find((r) => r.status === "pending");
              const approvedRequest = productRequests.find((r) => r.status === "approved");
              const isCurrentlySponsored = product.isSponsored || !!approvedRequest;

              return (
                <div
                  key={product.id}
                  className="border border-zinc-200/80 rounded-2xl p-4 flex gap-4 hover:shadow-md hover:border-orange-200 transition-all bg-white group"
                >
                  <img
                    loading="lazy"
                    src={getOptimizedImageUrl(product.image, 160) || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-zinc-100"
                  />
                  <div className="flex flex-col flex-1 min-w-0 py-0.5">
                    <h4 className="font-bold text-xs text-zinc-950 truncate" title={product.name}>
                      {product.name}
                    </h4>
                    <p className="text-xs font-mono font-extrabold text-orange-600 mt-0.5">
                      {product.price?.toLocaleString()} DA
                    </p>

                    <div className="mt-auto pt-2">
                      {isCurrentlySponsored ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold tracking-wider text-center flex items-center justify-center gap-1.5 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {t("Sponsorisé Actif")}
                        </div>
                      ) : pendingRequest ? (
                        <div className="w-full py-2 rounded-xl bg-amber-50 text-amber-700 text-[10px] uppercase font-bold tracking-wider text-center flex items-center justify-center gap-1.5 border border-amber-100">
                          <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                          {t("En Attente")}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenPackModal(product)}
                          className="w-full py-2 rounded-xl bg-zinc-900 text-white text-[10px] uppercase font-bold tracking-wider hover:bg-orange-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {t("Choisir un Pack")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History & Analytics Table */}
      <SponsorshipHistoryList requests={sponsorshipRequests} />

      {/* Modal Pack Selection */}
      <SponsorshipPackSelectorModal
        isOpen={!!selectedProductForPack}
        onClose={() => setSelectedProductForPack(null)}
        product={selectedProductForPack}
        packs={packs}
        onSubmit={handlePackSubmit}
      />
    </div>
  );
};
