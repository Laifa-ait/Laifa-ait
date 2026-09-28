import React from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WilayaFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedWilaya: string;
  onWilayaSelect: (w: string) => void;
  popularWilayas: string[];
}

export const WilayaFilterBar: React.FC<WilayaFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedWilaya,
  onWilayaSelect,
  popularWilayas,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("Rechercher une boutique, artisan, wilaya...")}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#dadce0] rounded-full text-xs sm:text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] border-none bg-transparent cursor-pointer p-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {popularWilayas.map((wil) => {
          const isSelected = selectedWilaya === wil;
          return (
            <button
              key={wil}
              type="button"
              onClick={() => onWilayaSelect(wil)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]"
                  : "bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8fafd]"
              }`}
            >
              {wil}
            </button>
          );
        })}
      </div>
    </div>
  );
};
