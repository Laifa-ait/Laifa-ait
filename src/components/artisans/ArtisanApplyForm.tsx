import React, { useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { ArtisanProfile, ArtisanTrade } from '../../types/artisan';
import { WilayaCommuneSelector } from './WilayaCommuneSelector';
import { submitArtisanApplication } from '../../services/artisan.api';

interface ArtisanApplyFormProps {
  trades: ArtisanTrade[];
  initialTradeId?: string;
  onSuccess: (profile: ArtisanProfile) => void;
}

export const ArtisanApplyForm: React.FC<ArtisanApplyFormProps> = ({
  trades,
  initialTradeId,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [tradeId, setTradeId] = useState(initialTradeId || '');
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [yearsOfExp, setYearsOfExp] = useState(3);
  const [wilaya, setWilaya] = useState('Alger');
  const [wilayaCode, setWilayaCode] = useState<string>('16');
  const [commune, setCommune] = useState('Alger Centre');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTrade = trades.find((t) => t.id === tradeId);

  const handleTogglePresetSpecialty = (spec: string) => {
    setSpecialtiesList((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !tradeId || !wilaya || !commune) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      const res = await submitArtisanApplication({
        fullName: fullName.trim(),
        professionalName: professionalName.trim() || undefined,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        bio: bio.trim(),
        tradeId,
        tradeName: selectedTrade?.name || 'Artisan',
        specialties: specialtiesList,
        yearsOfExperience: Number(yearsOfExp),
        wilaya,
        wilayaCode,
        commune,
        serviceArea: [commune],
        documents: [],
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setErrorMsg(res.error || 'Une erreur est survenue lors de la soumission.');
      }
    } catch {
      setErrorMsg('Erreur réseau ou serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Section 1: Identité */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            1. Informations Personnelles & Contacts
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nom & Prénom *</label>
            <input
              type="text"
              required
              placeholder="Ex: Karim Hadj"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nom commercial / Atelier</label>
            <input
              type="text"
              placeholder="Ex: Plomberie Express DZ"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Numéro de Téléphone Principal *</label>
            <input
              type="tel"
              required
              placeholder="0550 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Numéro WhatsApp</label>
            <input
              type="tel"
              placeholder="0550 00 00 00"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Métier & Spécialités */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Briefcase className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            2. Métier & Compétences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Métier Principal *</label>
            <select
              required
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
            >
              <option value="">Sélectionnez un métier</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Années d'expérience *</label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={yearsOfExp}
              onChange={(e) => setYearsOfExp(parseInt(e.target.value, 10) || 1)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        {selectedTrade?.specialties && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Spécialités recommandées :</label>
            <div className="flex flex-wrap gap-2">
              {selectedTrade.specialties.map((spec) => (
                <button
                  type="button"
                  key={spec}
                  onClick={() => handleTogglePresetSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    specialtiesList.includes(spec)
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Présentation / Biographie</label>
          <textarea
            rows={3}
            placeholder="Décrivez votre parcours, vos certifications..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
      </div>

      {/* Section 3: Wilaya & Localisation */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          3. Zone d'intervention (58 Wilayas)
        </h2>
        <WilayaCommuneSelector
          selectedWilaya={wilaya}
          selectedCommune={commune}
          onWilayaChange={(newWilaya: string, code: string) => {
            setWilaya(newWilaya);
            setWilayaCode(code);
          }}
          onCommuneChange={(newCommune: string) => setCommune(newCommune)}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? 'Soumission du dossier...' : "Soumettre ma candidature d'artisan"}
        </button>
      </div>
    </form>
  );
};
