import React, { useState } from "react";
import { MapPin, Plus, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { apiPost } from "../../lib/api";
import { UserProfile, UserAddress, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { AddressCardItem } from "./AddressCardItem";
import { AddressFormModal } from "./AddressFormModal";

interface AddressManagerProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export const AddressManager: React.FC<AddressManagerProps> = ({ currentUser, userProfile }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const addresses: UserAddress[] = userProfile?.shippingAddresses || [];

  const handleSaveAddress = async (addressData: UserAddress) => {
    try {
      let updatedAddresses: UserAddress[];
      const isExisting = addresses.some((a) => a.id === addressData.id);

      if (isExisting) {
        updatedAddresses = addresses.map((a) => {
          if (a.id === addressData.id) return addressData;
          if (addressData.isDefault) return { ...a, isDefault: false };
          return a;
        });
      } else {
        const isFirst = addresses.length === 0;
        const newAddr = { ...addressData, isDefault: addressData.isDefault || isFirst };
        updatedAddresses = newAddr.isDefault
          ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
          : [...addresses, newAddr];
      }

      await apiPost("/api/v1/auth/profile", {
        shippingAddresses: updatedAddresses,
      });

      toast.success(t("Adresse de livraison enregistrée avec succès !"));
      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      console.error("Save address failed:", err);
      toast.error(t("Impossible d'enregistrer l'adresse."));
      throw err;
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      await apiPost("/api/v1/auth/profile", { shippingAddresses: updated });
      toast.success(t("Adresse par défaut mise à jour."));
    } catch (err) {
      console.error("Set default failed:", err);
      toast.error(t("Erreur lors de la mise à jour."));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const addressToDelete = addresses.find((a) => a.id === id);
      let updated = addresses.filter((a) => a.id !== id);
      if (addressToDelete?.isDefault && updated.length > 0) {
        updated = updated.map((a, idx) => (idx === 0 ? { ...a, isDefault: true } : a));
      }
      await apiPost("/api/v1/auth/profile", { shippingAddresses: updated });
      toast.success(t("Adresse supprimée."));
    } catch (err) {
      console.error("Delete address failed:", err);
      toast.error(t("Erreur lors de la suppression."));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="address-manager-module">
      {/* Google Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
            {t("Adresses et livraisons")}
          </h2>
          <p className="text-[#5f6368] text-sm mt-1">
            {t("Gérez vos adresses de livraison en Algérie pour vos commandes Olmart.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full transition-all shadow-xs active:scale-95 cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" />
          <span>{t("Ajouter une adresse")}</span>
        </button>
      </div>

      {/* Info Context Card (Google Style) */}
      <div className="bg-[#e8f0fe] border border-[#d2e3fc] rounded-[24px] p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-white text-[#1a73e8] flex items-center justify-center shrink-0 shadow-xs">
          <Truck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium text-[#1a73e8]">{t("Livraison rapide dans 69 wilayas")}</h4>
          <p className="text-xs text-[#3c4043] leading-relaxed">
            {t(
              "Vos adresses enregistrées sont utilisées pour pré-remplir la livraison et calculer automatiquement les tarifs d'expédition à domicile ou en point relais."
            )}
          </p>
        </div>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-[#dadce0] rounded-[28px] p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#f8fafd] text-[#5f6368] flex items-center justify-center mx-auto border border-[#dadce0]">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-[#202124]">
              {t("Aucune adresse enregistrée")}
            </h3>
            <p className="text-xs text-[#5f6368]">
              {t("Ajoutez votre première adresse pour commander plus rapidement sur Olmart.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full transition-colors cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Ajouter une adresse")}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCardItem
              key={addr.id}
              address={addr}
              onSetDefault={handleSetDefault}
              onEdit={(a) => {
                setEditingAddress(a);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Google Material 3 Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
        defaultName={userProfile?.displayName || currentUser?.displayName || ""}
      />
    </div>
  );
};
