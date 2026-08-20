import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HardHat, ShieldCheck, Send, CheckCircle2, ArrowRight, FileText, UploadCloud, Award, CreditCard, ChevronRight, Check } from 'lucide-react';
import { registerArtisan } from '../../services/bricolage.api';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { ALGERIAN_WILAYAS_LIST, getCommunesForWilaya } from '../../data/algeriaRegions';

interface ArtisanRegistrationModalProps {
  onClose: () => void;
  onSuccessRegistration?: (profile: ActiveArtisanProfile) => void;
}

export const ArtisanRegistrationModal: React.FC<ArtisanRegistrationModalProps> = ({ onClose, onSuccessRegistration }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Profile Info
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('Plomberie & Chauffage');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const availableCommunes = getCommunesForWilaya(wilaya);
  const [commune, setCommune] = useState(availableCommunes[0] || '');
  const [phone, setPhone] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(5);
  const [isAvailable24_7, setIsAvailable24_7] = useState(true);

  // Step 2: Verification Documents
  const [identityType, setIdentityType] = useState<'cni' | 'passport' | 'permis'>('cni');
  const [identityNumber, setIdentityNumber] = useState('');
  const [identityFile, setIdentityFile] = useState<{ name: string; url: string } | null>(null);

  const [diplomaTitle, setDiplomaTitle] = useState('');
  const [diplomaInstitution, setDiplomaInstitution] = useState('');
  const [diplomaFile, setDiplomaFile] = useState<{ name: string; url: string } | null>(null);

  const [registryNumber, setRegistryNumber] = useState('');
  const [camWilaya, setCamWilaya] = useState(wilaya);
  const [registryFile, setRegistryFile] = useState<{ name: string; url: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<ActiveArtisanProfile | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleWilayaChange = (newWilaya: string) => {
    setWilaya(newWilaya);
    const newCommunes = getCommunesForWilaya(newWilaya);
    setCommune(newCommunes[0] || '');
    setCamWilaya(newWilaya);
  };

  // Mock file uploader helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<{ name: string; url: string } | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setter({ name: file.name, url: fakeUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setLoading(true);
    const res = await registerArtisan({
      fullName,
      specialty,
      wilaya,
      commune,
      phone,
      registryNumber,
      yearsOfExperience,
      isAvailable24_7,
      identityDoc: identityNumber || identityFile ? {
        type: identityType,
        number: identityNumber || 'CNI-DZ-889922',
        fileName: identityFile?.name || 'Copie_CNI_Artisan.pdf',
        fileUrl: identityFile?.url || ''
      } : undefined,
      diplomaDoc: diplomaTitle || diplomaFile ? {
        title: diplomaTitle || 'Diplôme d\'Aptitude Professionnelle CAP',
        institution: diplomaInstitution || 'Centre de Formation Professionnelle IFP',
        fileName: diplomaFile?.name || 'Diplome_Qualif.pdf',
        fileUrl: diplomaFile?.url || ''
      } : undefined,
      registryDoc: registryNumber || registryFile ? {
        number: registryNumber || `CAM-${wilaya.split(' - ')[0]}-2026`,
        camWilaya: camWilaya,
        fileName: registryFile?.name || 'Carte_Artisan_CAM.pdf',
        fileUrl: registryFile?.url || ''
      } : undefined
    });

    const newProfile: ActiveArtisanProfile = res.profile || {
      id: res.applicationId || `ARTISAN-${Date.now()}`,
      fullName,
      specialty,
      wilaya,
      commune: commune || 'Centre',
      phone,
      registryNumber,
      yearsOfExperience,
      isAvailable24_7,
      registeredAt: new Date().toISOString(),
      verifiedBadge: false,
      rating: 5.0,
      verificationStatus: 'pending_review'
    };

    setCreatedProfile(newProfile);
    setLoading(false);
    setResult(res);

    if (onSuccessRegistration) {
      onSuccessRegistration(newProfile);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 text-slate-900 max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md border border-amber-400 shrink-0">
              <HardHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded border border-amber-300">
                Accréditation Pro & Vérification Olma Safe
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Inscrivez votre activité d'artisan en Algérie
              </h2>
            </div>
          </div>

          {/* Steps Indicator */}
          {!result && (
            <div className="flex items-center gap-3 mb-6 bg-slate-100 p-2 rounded-2xl border border-slate-200 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  step === 1 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-900/10 text-[11px] flex items-center justify-center font-black">1</span>
                <span>Informations Pro</span>
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  step === 2 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Pièces & Diplômes</span>
              </button>
            </div>
          )}

          {result ? (
            <div className="space-y-5 py-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Dossier d'Inscription Transmis avec Succès !
              </h3>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Statut du Dossier : En cours de vérification par l'Équipe Olma</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Bienvenue <strong className="text-slate-900">{createdProfile?.fullName}</strong>. Vos pièces justificatives (Pièce d'Identité, Diplôme et Carte Artisan CAM) sont enregistrées. Votre Badge de Confirmation Pro sera activé sous 24h.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-amber-400"
              >
                <span>Accéder à mon Espace Pro Artisan</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                /* Step 1: Basic Profile */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1 block">
                      Nom Complet / Établissement Professionnel * :
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Mourad Benali (Plomberie Express Sanitaire)"
                      className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Spécialité Principale * :
                      </label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Plomberie & Chauffage">Plomberie & Chauffage</option>
                        <option value="Électricité Bâtiment">Électricité Bâtiment</option>
                        <option value="Climatisation & Froid">Climatisation & Froid</option>
                        <option value="Peinture & Plâtrerie BA13">Peinture & Plâtrerie BA13</option>
                        <option value="Menuiserie Aluminium / PVC">Menuiserie Aluminium / PVC</option>
                        <option value="Serrurerie & Dépannage Urgence">Serrurerie & Dépannage Urgence</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Années d'Expérience * :
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Wilaya & Commune */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Wilaya d'intervention principale * :
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => handleWilayaChange(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        {ALGERIAN_WILAYAS_LIST.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Commune de Résidence / Base * :
                      </label>
                      <select
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        {availableCommunes.length > 0 ? (
                          availableCommunes.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))
                        ) : (
                          <option value="">Sélectionnez une wilaya</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1 block">
                      Téléphone Direct Joignable * :
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550 00 00 00 / 0770 00 00 00"
                      className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="avail247"
                      checked={isAvailable24_7}
                      onChange={(e) => setIsAvailable24_7(e.target.checked)}
                      className="w-4 h-4 text-amber-500 border-2 border-slate-300 rounded focus:ring-amber-400"
                    />
                    <label htmlFor="avail247" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Disponible pour interventions d'urgence SOS (24h/24 & 7j/7)
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={!fullName || !phone}
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Étape Suivante : Ajouter les Pièces de Vérification</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              ) : (
                /* Step 2: Documents Verification Upload */
                <div className="space-y-5">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      La vérification des diplômes et cartes d'artisan permet d'obtenir le <strong>Badge VÉRIFIÉ OLMA SAFE</strong> et de prioriser vos propositions auprès des clients.
                    </span>
                  </div>

                  {/* 1. Pièce d'Identité */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black text-slate-900">1. Pièce d'Identité Officielle (CNI / Passeport / Permis)</h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">Requis</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Type de Document :</label>
                        <select
                          value={identityType}
                          onChange={(e) => setIdentityType(e.target.value as "cni" | "passport" | "permis")}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900"
                        >
                          <option value="cni">Carte Nationale d'Identité (CNI)</option>
                          <option value="passport">Passeport Algérien</option>
                          <option value="permis">Permis de Conduire</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">N° de la Pièce :</label>
                        <input
                          type="text"
                          value={identityNumber}
                          onChange={(e) => setIdentityNumber(e.target.value)}
                          placeholder="Ex: 109823901"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    {/* File Attachment */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Fichier Recto/Verso ou Scan PDF :</label>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:border-amber-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, setIdentityFile)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {identityFile ? (
                          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold px-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <Check className="w-4 h-4 text-emerald-600" />
                              {identityFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Prêt pour envoi</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            <span>Cliquez pour joindre votre pièce d'identité (JPG, PNG, PDF)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Diplômes et Certificats */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black text-slate-900">2. Diplôme ou Certificat de Qualification Professionnelle</h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">Conseillé</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Intitulé du Diplôme / Attestation :</label>
                        <input
                          type="text"
                          value={diplomaTitle}
                          onChange={(e) => setDiplomaTitle(e.target.value)}
                          placeholder="Ex: CAP Plomberie / BTP Électricité"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Établissement / Centre émetteur :</label>
                        <input
                          type="text"
                          value={diplomaInstitution}
                          onChange={(e) => setDiplomaInstitution(e.target.value)}
                          placeholder="Ex: IFP Alger / Ministère de la Formation Pro"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Scan du Diplôme / Attestation :</label>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:border-amber-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, setDiplomaFile)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {diplomaFile ? (
                          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold px-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <Check className="w-4 h-4 text-emerald-600" />
                              {diplomaFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Prêt pour envoi</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            <span>Joindre votre diplôme ou attestation professionnelle</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Registre de Commerce ou Carte d'Artisan CAM */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black text-slate-900">3. Carte d'Artisan (Chambre des Métiers - CAM) / Registre</h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">Optionnel</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">N° Registre / Carte Artisan CAM :</label>
                        <input
                          type="text"
                          value={registryNumber}
                          onChange={(e) => setRegistryNumber(e.target.value)}
                          placeholder="Ex: CAM-16-2026-901"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Chambre des Métiers (Wilaya) :</label>
                        <input
                          type="text"
                          value={camWilaya}
                          onChange={(e) => setCamWilaya(e.target.value)}
                          placeholder="Ex: CAM Alger"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Scan de la Carte d'Artisan ou Extrait Registre :</label>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-white hover:border-amber-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, setRegistryFile)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {registryFile ? (
                          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold px-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <Check className="w-4 h-4 text-emerald-600" />
                              {registryFile.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Prêt pour envoi</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            <span>Joindre la Carte d'Artisan CAM ou le Registre</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 border border-amber-400"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>{loading ? 'Soumission du dossier...' : 'Soumettre mon Dossier pour Validation Pro'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
