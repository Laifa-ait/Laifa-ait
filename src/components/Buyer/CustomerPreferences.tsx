import React, { useState } from "react";
import { Sparkles, Check, RefreshCw, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { apiPost } from "../../lib/api";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { PreferenceCategoryCard } from "./preferences/PreferenceCategoryCard";
import { CATEGORIES_DATA } from "./preferences/categoriesData";

interface CustomerPreferencesProps {
  currentUser: FirebaseUser | { uid: string } | null;
  userProfile: UserProfile | null;
}

export const CustomerPreferences: React.FC<CustomerPreferencesProps> = ({
  currentUser,
  userProfile,
}) => {
  const { t } = useTranslation();

  const initialInterests: string[] =
    (userProfile?.preferences?.interests as string[]) ||
    (userProfile?.interests as string[]) ||
    [];

  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Maison & Déco": true,
    "Électronique & High-Tech": true,
  });
  const [saving, setSaving] = useState(false);

  const allAvailableSubcategories = Object.values(CATEGORIES_DATA).flatMap((c) => c.subcategories);

  const handleToggleSubcategory = (sub: string) => {
    setSelectedInterests((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };

  const handleToggleSelectAllCategory = (catName: string) => {
    const subs = CATEGORIES_DATA[catName]?.subcategories || [];
    const allSelected = subs.every((sub) => selectedInterests.includes(sub));

    if (allSelected) {
      setSelectedInterests((prev) => prev.filter((item) => !subs.includes(item)));
    } else {
      setSelectedInterests((prev) => Array.from(new Set([...prev, ...subs])));
    }
    setExpandedCategories((prev) => ({ ...prev, [catName]: true }));
  };

  const handleSelectAll = () => {
    setSelectedInterests(allAvailableSubcategories);
    toast.success(t("Toutes les thématiques ont été sélectionnées."));
  };

  const handleResetAll = () => {
    setSelectedInterests([]);
    toast.success(t("Toutes les préférences ont été réinitialisées."));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return toast.error(t("Utilisateur non connecté."));

    setSaving(true);
    try {
      await apiPost("/api/v1/auth/profile", {
        preferences: {
          interests: selectedInterests,
          updatedAt: new Date().toISOString(),
        },
        interests: selectedInterests,
      });

      toast.success(t("🎯 Vos préférences d'achat ont été enregistrées avec succès !"));
    } catch (err: unknown) {
      console.error("Save preferences failed:", err);
      toast.error(t("Erreur lors de l'enregistrement de vos préférences."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="customer-preferences-module">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          {t("Préférences d'achat")}
        </h2>
        <p className="text-[#5f6368] text-sm mt-1">
          {t("Personnalisez vos centres d'intérêt pour recevoir des recommandations adaptées sur Olmart.")}
        </p>
      </div>

      {/* Info Context Card (Google Style) */}
      <div className="bg-[#e8f0fe] border border-[#d2e3fc] rounded-[24px] p-5 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-white text-[#1a73e8] flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-[#1a73e8]">
            {t("Recommandations intelligentes sur-mesure")}
          </h4>
          <p className="text-xs text-[#3c4043] leading-relaxed">
            {t(
              "Les thématiques cochées ci-dessous permettent à nos algorithmes de vous proposer en priorité des produits, promotions et boutiques correspondant à vos goûts."
            )}
          </p>
        </div>
      </div>

      {/* Quick Actions & Stats Bar */}
      <div className="bg-white border border-[#dadce0] rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8]">
            {t("{{count}} thématiques sélectionnées", { count: selectedInterests.length })}
          </span>
          {selectedInterests.length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs font-medium text-[#d93025] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("Tout effacer")}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-3 py-1.5 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            {t("Tout sélectionner")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSavePreferences}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-50 border-none"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{saving ? t("Enregistrement...") : t("Enregistrer")}</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        {Object.entries(CATEGORIES_DATA).map(([catName, data]) => (
          <PreferenceCategoryCard
            key={catName}
            categoryName={catName}
            icon={data.icon}
            subcategories={data.subcategories}
            selectedInterests={selectedInterests}
            isExpanded={Boolean(expandedCategories[catName])}
            onToggleExpand={() =>
              setExpandedCategories((prev) => ({
                ...prev,
                [catName]: !prev[catName],
              }))
            }
            onToggleSelectAll={() => handleToggleSelectAllCategory(catName)}
            onToggleSubcategory={handleToggleSubcategory}
          />
        ))}
      </div>
    </div>
  );
};
