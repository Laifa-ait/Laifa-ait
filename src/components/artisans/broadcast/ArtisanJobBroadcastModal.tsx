import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, AlertCircle } from 'lucide-react';
import { BookingCategoryCard } from '../home/ArtisanCategoryBookingGrid';
import { ArtisanJobBroadcast } from '../../../types/artisan';
import { BroadcastPresetSelector } from './BroadcastPresetSelector';
import { BroadcastLocationSection } from './BroadcastLocationSection';
import { BroadcastContactSection } from './BroadcastContactSection';
import { BroadcastSuccessView } from './BroadcastSuccessView';
import { useArtisanBroadcastForm } from './useArtisanBroadcastForm';

interface ArtisanJobBroadcastModalProps {
  category: BookingCategoryCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (broadcast: ArtisanJobBroadcast) => void;
}

export const ArtisanJobBroadcastModal: React.FC<ArtisanJobBroadcastModalProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    selectedPreset,
    title,
    setTitle,
    description,
    setDescription,
    urgency,
    setUrgency,
    wilaya,
    setWilaya,
    commune,
    setCommune,
    budget,
    setBudget,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    loading,
    error,
    submittedBroadcast,
    communes,
    handleSelectPreset,
    handleSubmit,
  } = useArtisanBroadcastForm({ category, isOpen, onClose, onSuccess });

  if (!isOpen || !category) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-slate-200"
        >
          {/* Header Banner with Category Image / Artistic Model */}
          <div className="relative h-32 sm:h-36 bg-slate-900 overflow-hidden">
            {category.artComponent ? (
              <div className="w-full h-full opacity-90">
                <category.artComponent className="w-full h-full" />
              </div>
            ) : (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 ${category.badgeColor}`}>
                {category.badge}
              </span>
              <h3 className="text-lg font-black">{category.name}</h3>
              <p className="text-xs text-slate-300">
                Publier une annonce de recherche auprès des artisans vérifiés
              </p>
            </div>
          </div>

          {submittedBroadcast ? (
            <BroadcastSuccessView broadcast={submittedBroadcast} onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Presets */}
              <BroadcastPresetSelector
                presets={category.presets}
                selectedPreset={selectedPreset}
                onSelectPreset={handleSelectPreset}
              />

              {/* 2. Titre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Titre de l&apos;annonce *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Réparation fuite d'eau urgente"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 3. Urgence & Localisation */}
              <BroadcastLocationSection
                urgency={urgency}
                setUrgency={setUrgency}
                wilaya={wilaya}
                setWilaya={setWilaya}
                commune={commune}
                setCommune={setCommune}
                communes={communes}
              />

              {/* 4. Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Détails des travaux *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'état des lieux, les symptômes, les dimensions, l'étage..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 5. Vos coordonnées */}
              <BroadcastContactSection
                clientName={clientName}
                setClientName={setClientName}
                clientPhone={clientPhone}
                setClientPhone={setClientPhone}
                budget={budget}
                setBudget={setBudget}
              />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>{loading ? 'Publication en cours...' : 'Publier mon annonce aux artisans vérifiés'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
