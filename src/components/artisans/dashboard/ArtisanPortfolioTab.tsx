import React, { useState } from 'react';
import { Plus, Trash2, Camera } from 'lucide-react';
import { ArtisanProfile, ArtisanPortfolioItem } from '../../../types/artisan';
import { updateArtisanMyProfile } from '../../../services/artisan.api';

interface ArtisanPortfolioTabProps {
  profile: ArtisanProfile;
  onProfileUpdated: () => Promise<void>;
}

export const ArtisanPortfolioTab: React.FC<ArtisanPortfolioTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setSaving(true);
    try {
      const newItem: ArtisanPortfolioItem = {
        id: `proj_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        date: new Date().toISOString().split('T')[0],
      };

      const updatedPortfolio = [...(profile.portfolio || []), newItem];
      await updateArtisanMyProfile({ portfolio: updatedPortfolio });

      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setImageUrl('');
      await onProfileUpdated();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (itemId: string) => {
    const updatedPortfolio = (profile.portfolio || []).filter((p) => p.id !== itemId);
    await updateArtisanMyProfile({ portfolio: updatedPortfolio });
    await onProfileUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">Portfolio & Réalisations</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un projet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(profile.portfolio || []).length > 0 ? (
          profile.portfolio.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img loading="lazy" decoding="async" src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleDeleteProject(item.id)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-1">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.date && (
                  <p className="text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                    Réalisé le : {item.date}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Camera className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">Ajoutez des photos de vos précédents travaux.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Ajouter un projet au portfolio</h3>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Titre du projet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rénovation salle de bain à Hydra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">URL de la photo *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Travaux réalisés, matériaux..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  {saving ? 'Enregistrement...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
