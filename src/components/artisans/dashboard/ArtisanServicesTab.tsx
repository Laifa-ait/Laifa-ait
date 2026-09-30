import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArtisanProfile, ArtisanService } from '../../../types/artisan';
import { updateArtisanMyProfile } from '../../../services/artisan.api';

interface ArtisanServicesTabProps {
  profile: ArtisanProfile;
  onProfileUpdated: () => Promise<void>;
}

export const ArtisanServicesTab: React.FC<ArtisanServicesTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState<number | ''>('');
  const [priceUnit, setPriceUnit] = useState<ArtisanService['priceUnit']>('forfait');
  const [saving, setSaving] = useState(false);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const newService: ArtisanService = {
        id: `srv_${Date.now()}`,
        artisanId: profile.id,
        title: title.trim(),
        description: description.trim(),
        priceStartingFrom: startingPrice ? Number(startingPrice) : undefined,
        priceUnit,
        isActive: true,
      };

      const updatedServices = [...(profile.services || []), newService];
      await updateArtisanMyProfile({ services: updatedServices });

      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setStartingPrice('');
      await onProfileUpdated();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const updatedServices = (profile.services || []).filter((s) => s.id !== serviceId);
    await updateArtisanMyProfile({ services: updatedServices });
    await onProfileUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">{t("Prestations & Tarifs Indicatifs")}</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("Ajouter une prestation")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(profile.services || []).length > 0 ? (
          profile.services.map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm">{srv.title}</h3>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {srv.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-600">
                  {srv.priceStartingFrom
                    ? `${t("À partir de", "À partir de")} ${srv.priceStartingFrom.toLocaleString('fr-DZ')} DZD`
                    : t('Sur devis')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {srv.priceUnit === 'heure'
                    ? t('/ Heure', '/ Heure')
                    : srv.priceUnit === 'm2'
                    ? t('/ m²', '/ m²')
                    : srv.priceUnit === 'jour'
                    ? t('/ Jour', '/ Jour')
                    : t('Forfait')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Tag className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">{t("Aucune prestation configurée.")}</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">{t("Ajouter une prestation")}</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t("Titre de la prestation *")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("Ex: Installation chauffe-eau")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t("Description")}</label>
                <textarea
                  rows={2}
                  placeholder={t("Précisions sur l'intervention...", "Précisions sur l'intervention...")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t("Prix indicatif à partir de (DZD)")}</label>
                  <input
                    type="number"
                    placeholder="3000"
                    value={startingPrice}
                    onChange={(e) =>
                      setStartingPrice(e.target.value ? parseInt(e.target.value, 10) : '')
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t("Unité de tarification")}</label>
                  <select
                    value={priceUnit}
                    onChange={(e) =>
                      setPriceUnit(e.target.value as ArtisanService['priceUnit'])
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                  >
                    <option value="forfait">{t("Forfait")}</option>
                    <option value="heure">{t("Par heure")}</option>
                    <option value="jour">{t("Par jour")}</option>
                    <option value="m2">{t("Par m²")}</option>
                    <option value="prestation">{t("Sur devis")}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  {t("Fermer", "Annuler")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  {saving ? t('Enregistrement...') : t('Ajouter une prestation', 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
