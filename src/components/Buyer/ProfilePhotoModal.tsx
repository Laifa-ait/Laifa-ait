import React, { useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "../ui/OptimizedImage";
import { RETRO_AVATARS } from "../../utils/avatar";

interface ProfilePhotoModalProps {
  currentPhoto: string;
  onSelect: (url: string) => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ currentPhoto, onSelect }) => {
  const { t } = useTranslation();
  const [customPhotoInput, setCustomPhotoInput] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#1a73e8] p-1 bg-white shadow-xs">
          <OptimizedImage
            src={currentPhoto}
            alt="Selected Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#202124] mb-2.5">
          {t("Choisissez un avatar officiel :")}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-44 overflow-y-auto p-1 bg-[#f8fafd] rounded-2xl border border-[#e8eaed]">
          {RETRO_AVATARS.map((src, idx) => {
            const isSelected = currentPhoto === src;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelect(src);
                  setCustomPhotoInput("");
                }}
                className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 bg-white cursor-pointer ${
                  isSelected
                    ? "border-[#1a73e8] ring-2 ring-[#1a73e8]/20 scale-95"
                    : "border-[#dadce0] hover:border-[#1a73e8]/50"
                }`}
              >
                <OptimizedImage
                  src={src}
                  alt={`Avatar ${idx + 1}`}
                  className="w-full h-full object-cover rounded-full"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#1a73e8]/25 flex items-center justify-center rounded-full">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-medium text-[#5f6368] block">
          {t("Ou URL d'image personnalisée (HTTPS)")}
        </label>
        <input
          type="url"
          value={customPhotoInput}
          onChange={(e) => {
            setCustomPhotoInput(e.target.value);
            if (e.target.value.trim()) onSelect(e.target.value.trim());
          }}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
        />
      </div>
    </div>
  );
};
