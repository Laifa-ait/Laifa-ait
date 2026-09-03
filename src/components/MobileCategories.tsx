import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Search, Layers, Settings, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OlmaAppModule } from "../types/olmaUnivers";
import { fetchOlmaUniversApps } from "../services/olmaUnivers.api";
import { AppCard } from "./olmaUnivers/AppCard";
import { AppModal } from "./olmaUnivers/AppModal";
import { useAuth } from "../context/AuthContext";

export default function MobileCategories(): React.ReactElement {
  const { i18n } = useTranslation();
  const lang = ((i18n.language || "fr") as "fr" | "ar" | "en");
  const isRTL = lang === "ar";
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [apps, setApps] = useState<OlmaAppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<OlmaAppModule | null>(null);

  useEffect(() => {
    async function loadApps() {
      setLoading(true);
      const data = await fetchOlmaUniversApps();
      setApps(data);
      setLoading(false);
    }
    loadApps();
  }, []);

  const categories = [
    { id: "all", label: lang === "ar" ? "الكل" : "Tous" },
    { id: "services", label: lang === "ar" ? "صيانة وحرفيين" : "Bricolage & Artisans" },
    { id: "immo", label: lang === "ar" ? "عقارات وإيجار" : "Immobilier & Location" },
    { id: "auto", label: lang === "ar" ? "سيارات ومركبات" : "Véhicules & Auto" },
    { id: "ecommerce", label: lang === "ar" ? "التسوق" : "E-Commerce" },
    { id: "logistics", label: lang === "ar" ? "توصيل" : "Logistique" }
  ];

  const filteredApps = apps.filter((app) => {
    const titleMatch = (app.title[lang] || app.title.fr).toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (app.description[lang] || app.description.fr).toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = app.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const catMatch = selectedCategory === "all" || app.category === selectedCategory;

    return (titleMatch || descMatch || tagMatch) && catMatch;
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-32 pt-4 transition-colors" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em]">
                Écosystème Olmart
              </span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none uppercase">
              Univers <span className="text-orange-600 dark:text-orange-400">Olma</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg">
              Découvrez la suite d'applications et de services connectés conçus pour simplifier le quotidien en Algérie.
            </p>
          </div>

          {isAdmin && (
            <a
              href="/dashboard/admin/univers"
              className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span>Gérer dans l'Admin</span>
            </a>
          )}
        </header>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 p-6 sm:p-8 text-white shadow-xl border border-zinc-800"
        >
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
              <Rocket className="w-3 h-3" />
              Prochaines ouvertures
            </span>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              Des applications spécialisées pour le Bricolage, l'Immobilier & l'Automobile
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Olmart prépare des plateformes sur-mesure adaptées aux besoins locaux. Réservez votre accès en avant-première !
            </p>
          </div>
        </motion.div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une application (ex: Bricolage, Immo, Auto, Véhicules)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-white dark:bg-zinc-900 animate-pulse border border-zinc-200/50 dark:border-zinc-800" />
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} lang={lang} onSelect={(selected) => setSelectedApp(selected)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Layers className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500 font-medium">Aucune application ne correspond à votre recherche.</p>
          </div>
        )}

        {/* Interactive Modal */}
        <AppModal app={selectedApp} lang={lang} onClose={() => setSelectedApp(null)} />
      </div>
    </div>
  );
}
