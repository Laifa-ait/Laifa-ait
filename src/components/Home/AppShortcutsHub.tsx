import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShop } from "../../context/ShopContext";
import { OlmaAppModule } from "../../types/olmaUnivers";
import { fetchOlmaUniversApps } from "../../services/olmaUnivers.api";
import { DEFAULT_OLMA_APPS } from "../../data/olmaUniversData";
import { getAppIconComponent } from "../../utils/iconRegistry";

export const AppShortcutsHub: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { setActiveCategory } = useShop();
  const lang = (i18n.language || "fr") as "fr" | "ar" | "en";
  const isArabic = lang.startsWith("ar");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [apps, setApps] = useState<OlmaAppModule[]>(() =>
    DEFAULT_OLMA_APPS.filter(
      (a) => a.showInHomeShortcuts !== false && a.status !== "hidden"
    )
  );

  useEffect(() => {
    let isMounted = true;
    fetchOlmaUniversApps().then((fetchedApps) => {
      if (isMounted && Array.isArray(fetchedApps) && fetchedApps.length > 0) {
        const activeShortcuts = fetchedApps
          .filter((a) => a.showInHomeShortcuts !== false && a.status !== "hidden")
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        if (activeShortcuts.length > 0) {
          setApps(activeShortcuts);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleShortcutClick = (app: OlmaAppModule) => {
    if (app.actionType === "category" && app.targetRoute) {
      setActiveCategory(app.targetRoute);
      navigate("/shop");
    } else if (app.actionType === "external" && app.externalUrl) {
      window.location.href = app.externalUrl;
    } else if (app.targetRoute) {
      navigate(app.targetRoute);
    } else {
      navigate(`/univers/${app.slug || app.id}`);
    }
  };

  return (
    <div className="w-full py-2 sm:py-3 mb-2 sm:mb-4">
      {/* Horizontal App Shortcuts Carousel / Grid */}
      <div
        ref={scrollRef}
        className="flex items-center justify-start sm:justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-0.5"
      >
        {apps.map((app) => {
          const Icon = getAppIconComponent(app.icon);
          const displayName = isArabic && app.title.ar ? app.title.ar : app.title.fr;
          const displayBadge = app.badge
            ? isArabic && app.badge.ar
              ? app.badge.ar
              : app.badge.fr
            : null;

          return (
            <button
              key={app.id}
              onClick={() => handleShortcutClick(app)}
              className="flex flex-col items-center justify-center shrink-0 w-[4.4rem] sm:w-[5.2rem] group cursor-pointer border-none bg-transparent active:scale-95 transition-all duration-200 py-1"
            >
              {/* Icon Container with Gradient & Micro-Badge */}
              <div className="relative mb-1.5 flex items-center justify-center">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${
                    app.gradient || "from-sky-400 to-blue-600"
                  } p-0.5 shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300 flex items-center justify-center text-white`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] drop-shadow-xs" />
                </div>

                {/* Floating Micro-Badge */}
                {displayBadge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-tight whitespace-nowrap border border-white ${
                      app.badgeColor || "bg-red-500 text-white"
                    }`}
                  >
                    {displayBadge}
                  </span>
                )}
              </div>

              {/* Title label underneath */}
              <span className="text-[11px] sm:text-[12px] font-bold text-zinc-800 dark:text-zinc-200 text-center line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
