import React from "react";
import { Search, Filter, ShieldAlert, CheckCircle2, Layers, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReviewsAdminToolbarProps {
  activeTab: "flagged" | "all" | "approved";
  setActiveTab: (tab: "flagged" | "all" | "approved") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRating: number | "all";
  setSelectedRating: (rating: number | "all") => void;
  stats: {
    total: number;
    flaggedCount: number;
    avgRating: number;
  };
}

export const ReviewsAdminToolbar: React.FC<ReviewsAdminToolbarProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedRating,
  setSelectedRating,
  stats,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("À modérer / Signalés")}</p>
            <p className="text-2xl font-black text-zinc-900">{stats.flaggedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-zinc-700" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("Total des Avis")}</p>
            <p className="text-2xl font-black text-zinc-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-emerald-600 fill-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("Note Moyenne")}</p>
            <p className="text-2xl font-black text-zinc-900">{stats.avgRating > 0 ? `${stats.avgRating} / 5` : "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search controls */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              id="tab-flagged"
              onClick={() => setActiveTab("flagged")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "flagged"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>{t("Signalés")}</span>
              {stats.flaggedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                  {stats.flaggedCount}
                </span>
              )}
            </button>

            <button
              id="tab-all"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t("Tous les avis")}
            </button>

            <button
              id="tab-approved"
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "approved"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("Publiés")}</span>
            </button>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              id="select-rating-filter"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 outline-none focus:border-amber-500"
            >
              <option value="all">{t("Toutes les notes")}</option>
              <option value="5">5 ★★★★★</option>
              <option value="4">4 ★★★★☆</option>
              <option value="3">3 ★★★☆☆</option>
              <option value="2">2 ★★☆☆☆</option>
              <option value="1">1 ★☆☆☆☆</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-reviews"
            type="text"
            placeholder={t("Rechercher par client, produit, commande ou texte de l'avis...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
};
