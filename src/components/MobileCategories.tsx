import React, { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OlmaAppModule } from "../types/olmaUnivers";
import { fetchOlmaUniversApps } from "../services/olmaUnivers.api";
import { AppCard } from "./olmaUnivers/AppCard";
import { AppModal } from "./olmaUnivers/AppModal";

export default function MobileCategories(): React.ReactElement {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "fr") as "fr" | "ar" | "en";
  const isRTL = lang === "ar";

  const [apps, setApps] = useState<OlmaAppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<OlmaAppModule | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApps() {
      setLoading(true);
      const data = await fetchOlmaUniversApps();
      if (isMounted) {
        setApps(data);
        setLoading(false);
      }
    }
    loadApps();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50/70 pb-32 pt-2 sm:pt-4 transition-colors" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
        
        {/* Titre unique demandé par l'utilisateur */}
        <header className="pt-2 pb-1">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            {lang === "ar" ? "عالم أولما" : "Olma Univers"}
          </h1>
        </header>

        {/* Grille directe des applications */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-52 rounded-2xl bg-white animate-pulse border border-zinc-200/80 shadow-xs" />
            ))}
          </div>
        ) : apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} lang={lang} onSelect={setSelectedApp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 shadow-xs">
            <Layers className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-500 font-medium">
              {lang === "ar" ? "لا توجد تطبيقات متاحة حالياً." : "Aucune application disponible."}
            </p>
          </div>
        )}

        {/* Modal d'accès & liste d'attente */}
        <AppModal app={selectedApp} lang={lang} onClose={() => setSelectedApp(null)} />
      </div>
    </div>
  );
}
