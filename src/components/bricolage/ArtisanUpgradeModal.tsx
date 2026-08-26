import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HardHat, CheckCircle2, Sparkles, User, AlertCircle } from 'lucide-react';
import { upgradeToArtisanProfile } from '../../services/bricolage.api';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { useAuth } from '../../context/AuthContext';

interface ArtisanUpgradeModalProps {
  onClose: () => void;
  onSuccessUpgrade: (profile: ActiveArtisanProfile) => void;
  onOpenMainAuthModal?: () => void;
}

const ALGERIAN_WILAYAS = [
  '16 - Alger',
  '31 - Oran',
  '09 - Blida',
  '25 - Constantine',
  '23 - Annaba',
  '15 - Tizi Ouzou',
  '06 - Béjaïa',
  '19 - Sétif',
  '35 - Boumerdès',
  '42 - Tipaza'
];

export const ArtisanUpgradeModal: React.FC<ArtisanUpgradeModalProps> = ({
  onClose,
  onSuccessUpgrade,
  onOpenMainAuthModal
}) => {
  const { currentUser, userProfile } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [specialty, setSpecialty] = useState('Plomberie & Chauffage');
  const [wilaya, setWilaya] = useState(userProfile?.wilaya || '16 - Alger');
  const [commune] = useState<string>(
    typeof userProfile?.commune === 'string' ? userProfile.commune : 'Centre'
  );
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [registryNumber, setRegistryNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(5);
  const [isAvailable24_7, setIsAvailable24_7] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await upgradeToArtisanProfile({
      fullName: fullName || currentUser?.displayName || 'Artisan Olmart',
      specialty,
      wilaya,
      commune: commune || 'Centre',
      phone,
      registryNumber,
      yearsOfExperience,
      isAvailable24_7
    });

    setLoading(false);

    if (res.success && res.profile) {
      setSuccessMsg('Félicitations ! Votre compte a été mis à niveau avec le statut Artisan Certifié.');
      setTimeout(() => {
        onSuccessUpgrade(res.profile!);
      }, 700);
    } else {
      setErrorMsg(res.message || 'Erreur lors de la mise à niveau.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 text-slate-900 my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-md border border-amber-400">
              <HardHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded border border-amber-300">
                Liaison Compte Unique Olmart
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Evoluer vers le Statut Artisan Pro
              </h2>
            </div>
          </div>

          {!currentUser ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Connexion au Compte Olmart Requise
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed px-4">
                Grâce au système d’authentification unifié Olmart, vous utilisez le même compte pour le Marketplace et pour Olmart Bricolage. Veuillez vous connecter pour activer le statut artisan sur votre compte.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenMainAuthModal) onOpenMainAuthModal();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-400"
              >
                <User className="w-4 h-4" />
                <span>Se Connecter / S'inscrire à Olmart</span>
              </button>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white mb-6 flex items-center justify-between gap-3 border border-slate-800">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-black block truncate">{userProfile?.displayName || currentUser.email}</span>
                    <span className="text-[10px] text-amber-400 font-bold block truncate">{currentUser.email}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  Compte Connecté
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {!successMsg && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1 block">
                      Nom & Prénom / Nom d'Artisan :
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Mourad Benali (Brico Pro)"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
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
                        className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Plomberie & Chauffage">Plomberie & Chauffage</option>
                        <option value="Électricité Bâtiment">Électricité Bâtiment</option>
                        <option value="Climatisation & Froid">Climatisation & Froid</option>
                        <option value="Peinture & BA13">Peinture & Plâtrerie BA13</option>
                        <option value="Menuiserie Aluminium/PVC">Menuiserie Aluminium / PVC</option>
                        <option value="Serrurerie & Dépannage">Serrurerie & Dépannage</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Wilaya d'Intervention * :
                      </label>
                      <select
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      >
                        {ALGERIAN_WILAYAS.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        N° Téléphone Pro * :
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0550 00 00 00"
                        className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">
                        Années d'Expérience :
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1 block">
                      N° Carte Artisan / Registre (Optionnel) :
                    </label>
                    <input
                      type="text"
                      value={registryNumber}
                      onChange={(e) => setRegistryNumber(e.target.value)}
                      placeholder="Ex: ART-2026-16098"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="avail247_upgrade"
                      checked={isAvailable24_7}
                      onChange={(e) => setIsAvailable24_7(e.target.checked)}
                      className="w-4 h-4 text-amber-500 border-2 border-slate-300 rounded focus:ring-amber-400"
                    />
                    <label htmlFor="avail247_upgrade" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Activer la disponibilité SOS Dépannage Urgence (24/7)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-400"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{loading ? 'Mise à jour en cours...' : 'Activer le Statut Artisan sur Mon Compte'}</span>
                  </button>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
