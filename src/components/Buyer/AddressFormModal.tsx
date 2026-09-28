import React, { useState } from "react";
import { X, Check, RefreshCw, MapPin, User, Phone, Home, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { ALGERIA_REGIONS } from "../../data/algeriaRegions";
import { ALGERIA_WILAYAS } from "../../constants/wilayas";
import { UserAddress } from "../../domains/user/user.types";
import { generateClientUUID } from "../../utils/secureCrypto";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: UserAddress) => Promise<void>;
  initialAddress?: UserAddress | null;
  defaultName?: string;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  defaultName = "",
}) => {
  const { t } = useTranslation();
  const isEditing = Boolean(initialAddress);

  const [wilaya, setWilaya] = useState(initialAddress?.wilaya || "16 Alger");
  const [daira, setDaira] = useState(initialAddress?.daira || "Sidi M'Hamed");
  const [commune, setCommune] = useState(initialAddress?.commune || "Alger Centre");
  const [codePostal, setCodePostal] = useState(initialAddress?.codePostal || "16000");
  const [rue, setRue] = useState(initialAddress?.rue || initialAddress?.street || "");
  const [phone, setPhone] = useState(initialAddress?.phone || "");
  const [name, setName] = useState(initialAddress?.name || defaultName);
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault || false);
  const [addressType, setAddressType] = useState<"home" | "work">("home");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleWilayaChange = (val: string) => {
    setWilaya(val);
    const reg = ALGERIA_REGIONS[val];
    const dList = reg ? Object.keys(reg.dairas) : [];
    const firstD = dList[0] || "";
    const cList = reg ? reg.dairas[firstD] || [] : [];
    const prefix = val.substring(0, 2);
    setDaira(firstD);
    setCommune(cList[0] || "");
    setCodePostal(/^\d{2}$/.test(prefix) ? `${prefix}000` : "16000");
  };

  const handleDairaChange = (dairaVal: string) => {
    setDaira(dairaVal);
    const reg = ALGERIA_REGIONS[wilaya];
    const cList = reg ? reg.dairas[dairaVal] || [] : [];
    setCommune(cList[0] || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error(t("Veuillez saisir le nom du destinataire."));
    if (!rue.trim()) return toast.error(t("Veuillez saisir l'adresse exacte."));
    if (!phone.trim() || phone.replace(/\s+/g, "").length < 9) {
      return toast.error(t("Numéro de téléphone algérien invalide (9 ou 10 chiffres)."));
    }

    setSaving(true);
    try {
      await onSave({
        id: initialAddress?.id || `addr_${generateClientUUID().substring(0, 10)}`,
        wilaya,
        daira: daira.trim(),
        commune: commune.trim(),
        codePostal: codePostal.trim() || "16000",
        rue: rue.trim(),
        phone: phone.trim(),
        name: name.trim(),
        isShipping: true,
        isBilling: true,
        isDefault,
      });
      onClose();
    } catch {
      // Handled in parent
    } finally {
      setSaving(false);
    }
  };

  const reg = ALGERIA_REGIONS[wilaya];
  const dairas = reg ? Object.keys(reg.dairas) : [];
  const communes = reg && daira ? reg.dairas[daira] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] max-w-lg w-full border border-[#dadce0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base sm:text-lg font-semibold text-[#202124]">
            {isEditing ? t("Modifier l'adresse") : t("Ajouter une adresse de livraison")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3 pb-1">
            {[
              { id: "home", label: t("Domicile"), icon: Home },
              { id: "work", label: t("Travail / Bureau"), icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAddressType(id as "home" | "work")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  addressType === id
                    ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]"
                    : "border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8fafd]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">{t("Nom du destinataire")}</label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Ex: Selma Laifa")}
                className="w-full ps-9 pe-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Wilaya (69 wilayas)")}</label>
              <select
                value={wilaya}
                onChange={(e) => handleWilayaChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={`${w.code} ${w.name}`}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Daïra / Arrondissement")}</label>
              <select
                value={daira}
                onChange={(e) => handleDairaChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              >
                {dairas.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Commune / Baladia")}</label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              >
                {communes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Code postal (5 chiffres)")}</label>
              <input
                type="text"
                maxLength={5}
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, ""))}
                placeholder="16000"
                className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">{t("Rue, bâtiment, numéro de porte")}</label>
            <div className="relative">
              <MapPin className="absolute start-3 top-2.5 w-4 h-4 text-[#5f6368]" />
              <input
                type="text"
                required
                value={rue}
                onChange={(e) => setRue(e.target.value)}
                placeholder={t("Ex: 14 Rue de la Liberté, Bâtiment C")}
                className="w-full ps-9 pe-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">{t("Téléphone de contact pour le livreur")}</label>
            <div className="relative">
              <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550 12 34 56"
                className="w-full ps-9 pe-3 py-2 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] text-[#202124]"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#1a73e8] rounded-sm accent-[#1a73e8]"
            />
            <span className="text-xs sm:text-sm text-[#202124] font-medium">
              {t("Définir comme adresse de livraison par défaut")}
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f3f4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#1a73e8]/10 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-50 border-none"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{saving ? t("Enregistrement...") : t("Enregistrer")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
