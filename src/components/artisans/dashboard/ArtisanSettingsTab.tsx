import React, { useState } from 'react';
import { ArtisanProfile } from '../../../types/artisan';
import { updateArtisanMyProfile } from '../../../services/artisan.api';
import { WilayaCommuneSelector } from '../WilayaCommuneSelector';

interface ArtisanSettingsTabProps {
  profile: ArtisanProfile;
  onProfileUpdated: () => Promise<void>;
}

export const ArtisanSettingsTab: React.FC<ArtisanSettingsTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [professionalName, setProfessionalName] = useState(profile.professionalName || '');
  const [phone, setPhone] = useState(profile.phone);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [wilaya, setWilaya] = useState(profile.wilaya);
  const [wilayaCode, setWilayaCode] = useState(profile.wilayaCode);
  const [commune, setCommune] = useState(profile.commune);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateArtisanMyProfile({
        fullName,
        professionalName: professionalName || undefined,
        phone,
        whatsapp,
        bio,
        avatarUrl,
        wilaya,
        wilayaCode,
        commune,
      });
      setSavedSuccess(true);
      await onProfileUpdated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
        Paramètres du profil & Localisation
      </h2>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          Profil mis à jour avec succès !
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Nom & Prénom *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Nom Professionnel / Enseigne</label>
          <input
            type="text"
            value={professionalName}
            onChange={(e) => setProfessionalName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Téléphone d'appel *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">URL Photo de Profil / Avatar</label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">Biographie & Présentation</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-700">Wilaya & Commune principale</label>
        <WilayaCommuneSelector
          selectedWilaya={wilaya}
          selectedCommune={commune}
          onChange={(newWilaya, newCommune, code) => {
            setWilaya(newWilaya);
            setCommune(newCommune);
            setWilayaCode(code);
          }}
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs cursor-pointer"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
};
