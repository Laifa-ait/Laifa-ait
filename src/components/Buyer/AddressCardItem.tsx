import React from "react";
import { Home, Building2, Phone, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserAddress } from "../../domains/user/user.types";

interface AddressCardItemProps {
  address: UserAddress;
  onSetDefault: (id: string) => void;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
}

export const AddressCardItem: React.FC<AddressCardItemProps> = ({
  address,
  onSetDefault,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getAddressTypeIcon = () => {
    const lowerRue = (address.rue || "").toLowerCase();
    if (lowerRue.includes("bureau") || lowerRue.includes("travail") || lowerRue.includes("entreprise")) {
      return <Building2 className="w-4 h-4 text-[#1a73e8]" />;
    }
    return <Home className="w-4 h-4 text-[#1a73e8]" />;
  };

  return (
    <div
      className={`bg-white rounded-[24px] border transition-all shadow-xs overflow-hidden flex flex-col justify-between ${
        address.isDefault ? "border-[#1a73e8] ring-1 ring-[#1a73e8]/20" : "border-[#dadce0] hover:border-[#bdc1c6]"
      }`}
    >
      <div className="p-6 space-y-4">
        {/* Top Header with Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center">
              {getAddressTypeIcon()}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5f6368]">
              {address.rue && (address.rue.toLowerCase().includes("bureau") || address.rue.toLowerCase().includes("travail"))
                ? t("Travail")
                : t("Domicile")}
            </span>
          </div>

          {address.isDefault ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("Par défaut")}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSetDefault(address.id)}
              className="text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-2.5 py-1 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              {t("Définir par défaut")}
            </button>
          )}
        </div>

        {/* Address Info */}
        <div className="space-y-1.5">
          <h4 className="text-base font-semibold text-[#202124]">
            {address.name || t("Destinataire")}
          </h4>
          <p className="text-sm text-[#3c4043] leading-relaxed">
            {address.rue || address.street || t("Adresse non spécifiée")}
          </p>
          <p className="text-sm font-medium text-[#202124]">
            {[address.commune, address.daira, address.wilaya].filter(Boolean).join(" • ")}
            {address.codePostal ? ` (${address.codePostal})` : ""}
          </p>
          {address.phone && (
            <div className="flex items-center gap-2 pt-1 text-xs text-[#5f6368]">
              <Phone className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>{address.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-3 bg-[#f8fafd] border-t border-[#f1f3f4] flex items-center justify-between">
        <div className="flex items-center gap-1">
          {address.isShipping && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white border border-[#dadce0] text-[#5f6368]">
              {t("Livraison")}
            </span>
          )}
          {address.isBilling && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white border border-[#dadce0] text-[#5f6368]">
              {t("Facturation")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(address)}
            aria-label={t("Modifier")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors cursor-pointer border-none bg-transparent"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(address.id)}
            aria-label={t("Supprimer")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] transition-colors cursor-pointer border-none bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
