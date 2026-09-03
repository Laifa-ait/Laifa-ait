import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, MapPin, Save, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';
import { ALGERIA_WILAYAS_DATABASE } from '../../data/algerianCommunesDatabase';

export const ProfileSettingsSection: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>((typeof userProfile?.displayName === 'string' && userProfile.displayName) || currentUser?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState<string>((typeof userProfile?.phoneNumber === 'string' && userProfile.phoneNumber) || '');
  const [preferredWilaya, setPreferredWilaya] = useState<string>((typeof userProfile?.wilaya === 'string' && userProfile.wilaya) || 'Alger');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    try {
      if (updateUserProfile) {
        await updateUserProfile({
          displayName,
          phoneNumber,
          wilaya: preferredWilaya,
        });
      }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur de mise à jour du profil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Paramètres du compte
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gérez vos informations personnelles et vos préférences immobilières
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Email read-only */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-stone-400" />
            <span>Adresse Email (liée au compte)</span>
          </label>
          <input
            type="email"
            value={currentUser?.email || ''}
            disabled
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 font-medium cursor-not-allowed"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-700" />
            <span>Nom et Prénom</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ex: Karim Benali"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Numéro de Téléphone</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ex: 0550 12 34 56"
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Wilaya preference */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Wilaya principale de recherche</span>
          </label>
          <select
            value={preferredWilaya}
            onChange={(e) => setPreferredWilaya(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          >
            {ALGERIA_WILAYAS_DATABASE.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name} ({w.name_ar})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications toggle */}
        <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-stone-500" />
            <div>
              <p className="text-xs font-bold text-stone-800">Alertes nouveaux biens & messages</p>
              <p className="text-[11px] text-stone-500">Recevoir des notifications lors d'un nouveau message de visite</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              notificationsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save button & success message */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#1a3831] text-[#ebdcb8] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#122b24] shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>

          {isSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Modifications enregistrées avec succès</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
