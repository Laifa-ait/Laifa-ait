import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Send,
  HardHat,
  Camera,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { BricolageServiceCategory, ServiceUrgency } from '../../types/bricolage';
import { submitQuoteRequest } from '../../services/bricolage.api';
import { ALGERIAN_WILAYAS_LIST, getCommunesForWilaya } from '../../data/algeriaRegions';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

interface ProjectWizardModalProps {
  category: BricolageServiceCategory | null;
  initialTask?: string;
  lang: 'fr' | 'ar' | 'en';
  onClose: () => void;
}

// Sample project media library items for in-app media gallery picker
const SAMPLE_MEDIA_GALLERY = [
  { id: 'm1', name: 'Fuite sous évier / Tuyauterie', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80', tag: 'Plomberie' },
  { id: 'm2', name: 'Panneau / Tableau électrique', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', tag: 'Électricité' },
  { id: 'm3', name: 'Chauffe-eau & Chaudière', url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', tag: 'Chauffage' },
  { id: 'm4', name: 'Installation Climatisation Split', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80', tag: 'Climatisation' },
  { id: 'm5', name: 'Rénovation Peinture Murale', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80', tag: 'Peinture' },
  { id: 'm6', name: 'Serrure & Portefeuille', url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', tag: 'Serrurerie' },
  { id: 'm7', name: 'Dépannage Robinetterie', url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80', tag: 'Plomberie' },
  { id: 'm8', name: 'Raccordement Électrique', url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80', tag: 'Électricité' }
];

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  category,
  initialTask,
  lang,
  onClose
}) => {
  const { tBricolage } = useBricolageI18n();
  const [selectedTask, setSelectedTask] = useState(initialTask || (category?.popularServices[0] || 'Dépannage Général'));
  const [wilaya, setWilaya] = useState('16 - Alger');
  const availableCommunes = getCommunesForWilaya(wilaya);
  const [commune, setCommune] = useState(availableCommunes[0] || '');
  const [urgency, setUrgency] = useState<ServiceUrgency>('normal');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);

  // In-app Media Gallery Modal State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallerySelected, setGallerySelected] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; requestId?: string } | null>(null);

  const handleWilayaChange = (newWilaya: string) => {
    setWilaya(newWilaya);
    const newCommunes = getCommunesForWilaya(newWilaya);
    setCommune(newCommunes[0] || '');
  };

  // Native File Upload Handler with Strict 5-Photo Cap
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoWarning(null);
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'));

    if (projectPhotos.length >= 5) {
      setPhotoWarning('⚠️ Limite maximale atteinte : Vous ne pouvez pas sélectionner plus de 5 photos.');
      e.target.value = '';
      return;
    }

    const availableSlots = 5 - projectPhotos.length;
    if (files.length > availableSlots) {
      setPhotoWarning(`⚠️ Seules ${availableSlots} photo(s) ont été conservées pour respecter la limite stricte de 5 photos au total.`);
    }

    const filesToUpload = files.slice(0, availableSlots);
    let processed = 0;

    filesToUpload.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProjectPhotos((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, event.target!.result as string].slice(0, 5);
          });
        }
        processed++;
        if (processed === filesToUpload.length) {
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    });

    if (filesToUpload.length === 0) {
      e.target.value = '';
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotoWarning(null);
    setProjectPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Open Media Gallery Modal
  const openGalleryModal = () => {
    setGallerySelected([...projectPhotos]);
    setIsGalleryOpen(true);
  };

  // Toggle selection in gallery modal strictly enforcing max 5
  const toggleGalleryPhoto = (photoUrl: string) => {
    if (gallerySelected.includes(photoUrl)) {
      setGallerySelected((prev) => prev.filter((u) => u !== photoUrl));
      setPhotoWarning(null);
    } else {
      if (gallerySelected.length >= 5) {
        setPhotoWarning('⚠️ Limite atteinte : Vous ne pouvez pas sélectionner plus de 5 photos au total.');
        return;
      }
      setGallerySelected((prev) => [...prev, photoUrl]);
    }
  };

  const confirmGallerySelection = () => {
    setProjectPhotos(gallerySelected.slice(0, 5));
    setIsGalleryOpen(false);
  };

  if (!category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    setLoading(true);
    const res = await submitQuoteRequest({
      serviceCategoryId: category.id,
      serviceName: selectedTask,
      wilaya,
      commune,
      urgency,
      description,
      customerName,
      customerPhone,
      projectPhotos
    });
    setLoading(false);
    setResult(res);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-slate-200 text-slate-900"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center font-black">
              <HardHat className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                {tBricolage('wizard.modalTitle', "DEMANDE D'INTERVENTION OLMA BRICOLAGE")}
              </span>
              <h2 className="text-xl font-black text-slate-900">
                {category.name[lang] || category.name.fr}
              </h2>
            </div>
          </div>

          {result ? (
            <div className="space-y-4 py-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {tBricolage('wizard.successTitle', 'Demande transmise avec succès !')}
              </h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                {result.message}
              </p>
              {result.requestId && (
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-800 border border-slate-200">
                  {tBricolage('wizard.refNo', 'N° Référence :')} {result.requestId}
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-lg"
                >
                  {tBricolage('common.close', 'Fermer')} & Revenir à Olma Bricolage
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Selection */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  1. {tBricolage('wizard.step1Category', 'Prestation souhaitée')} :
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {category.popularServices.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Autre demande spécifique">Autre prestation spécifique</option>
                </select>
              </div>

              {/* Location & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                    2. {tBricolage('common.wilaya', 'Wilaya')} :
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => handleWilayaChange(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {ALGERIAN_WILAYAS_LIST.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                    Commune (Baladia) :
                  </label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
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
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  Urgence de l'intervention :
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as ServiceUrgency)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="normal">Standard (Dans la semaine)</option>
                  <option value="urgent_24h">Sous 24 Heures</option>
                  <option value="emergency">Dépannage Immédiat (Urgent 24/7)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  3. Détails du problème ou du projet :
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez en quelques mots ce qu'il faut réparer ou installer..."
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Photos Attachment for Artisans */}
              <div className="bg-amber-500/5 p-3.5 rounded-2xl border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>4. Photos du problème ou du chantier (Max 5 photos) :</span>
                  </label>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    projectPhotos.length >= 5
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {projectPhotos.length} / 5 photos
                  </span>
                </div>

                {/* Upload & Media Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {projectPhotos.length < 5 ? (
                    <>
                      <button
                        type="button"
                        onClick={openGalleryModal}
                        className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 border border-amber-400"
                      >
                        <ImageIcon className="w-4 h-4 text-slate-950" />
                        <span>Sélectionner dans la Galerie Media</span>
                      </button>

                      <label className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-800 font-extrabold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm shrink-0">
                        <UploadCloud className="w-4 h-4 text-amber-600" />
                        <span>Depuis votre appareil</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <div className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-600 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-not-allowed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Limite maximale de 5 photos atteinte</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  Ajoutez jusqu'à 5 photos claires de la panne ou du lieu pour aider l'artisan à évaluer son devis.
                </p>

                {/* Warning / Notification Banner */}
                {photoWarning && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-start gap-2">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <span>{photoWarning}</span>
                  </div>
                )}

                {/* Thumbnail Previews */}
                {projectPhotos.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                    {projectPhotos.map((photo, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-xs bg-slate-900">
                        <img
                          src={photo}
                          alt={`Photo chantier ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 group-hover:opacity-100 hover:scale-110 transition-all"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Nom & Prénom * :
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Yacine K."
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Numéro de Téléphone * :
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 0550 12 34 56"
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading || !customerName || !customerPhone}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 border border-amber-400"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{loading ? 'Transmissions...' : 'Envoyer la demande d\'intervention'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* In-App Media Gallery Selector Modal (Exact Google Photos Picker UX) */}
      {isGalleryOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans overflow-hidden"
        >
          {/* Top Search Bar */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                readOnly
                value="Rechercher Google Photos / Media"
                className="w-full pl-10 pr-4 py-2 bg-slate-800/90 text-slate-200 text-xs font-semibold rounded-full border border-slate-700/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Header Tabs */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-900">
            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-full bg-slate-900 text-slate-400 text-xs font-bold hover:text-slate-200"
            >
              <span>Collections</span>
            </button>
          </div>

          {/* Warning Banner if user tries to pick more than 5 */}
          {photoWarning && (
            <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{photoWarning}</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoWarning(null)}
                className="text-amber-400 text-xs underline font-bold ml-2"
              >
                Masquer
              </button>
            </div>
          )}

          {/* Gallery Media Grid */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {/* Native Device Upload Card */}
            <label className="aspect-square rounded-2xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all">
              <UploadCloud className="w-6 h-6 mb-1 text-amber-400" />
              <span className="text-[11px] font-black leading-tight">Importer photo</span>
              <span className="text-[9px] text-amber-300/80 font-bold mt-0.5">Depuis l'appareil</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {/* Media Items */}
            {SAMPLE_MEDIA_GALLERY.map((media) => {
              const isSelected = gallerySelected.includes(media.url);
              const isMaxReached = gallerySelected.length >= 5 && !isSelected;

              return (
                <div
                  key={media.id}
                  onClick={() => toggleGalleryPhoto(media.url)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/50 scale-[0.98]'
                      : isMaxReached
                        ? 'border-slate-800 opacity-40 cursor-not-allowed hover:border-slate-800'
                        : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Top-Left Circular Checkmark Badge (Exact Google Photos Picker Style) */}
                  <div className="absolute top-2 left-2 z-10">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-900/60 border-2 border-white/80 backdrop-blur-xs" />
                    )}
                  </div>

                  {/* Tag label */}
                  <div className="absolute bottom-1 left-1 right-1 bg-slate-950/70 backdrop-blur-xs px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-slate-200 truncate">
                    {media.tag}
                  </div>

                  {/* Lock Indicator when 5 limit reached */}
                  {isMaxReached && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-1 text-center">
                      <span className="text-[9px] font-black text-rose-300 bg-rose-950/90 px-1.5 py-0.5 rounded border border-rose-800">
                        Max 5
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Sticky Action Bar (Matching User Screenshot Bar) */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  {gallerySelected.length}
                </span>
                <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                  / 5 photos sélectionnées
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (gallerySelected.length === 0) {
                    setPhotoWarning('Veuillez sélectionner au moins 1 photo.');
                  } else {
                    alert(`Prévisualisation de ${gallerySelected.length} photo(s) sélectionnée(s).`);
                  }
                }}
                className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Prévisualiser
              </button>

              <button
                type="button"
                onClick={confirmGallerySelection}
                className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition-transform active:scale-95"
              >
                OK ({gallerySelected.length})
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
