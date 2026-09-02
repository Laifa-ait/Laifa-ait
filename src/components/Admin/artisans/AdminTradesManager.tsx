import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { ArtisanTrade } from '../../../types/artisan';
import { adminSaveTrade, adminDeleteTrade } from '../../../services/artisan.api';

interface AdminTradesManagerProps {
  trades: ArtisanTrade[];
  onTradesUpdated: () => void;
}

export const AdminTradesManager: React.FC<AdminTradesManagerProps> = ({
  trades,
  onTradesUpdated,
}) => {
  const [editingTrade, setEditingTrade] = useState<Partial<ArtisanTrade> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrade?.name || !editingTrade?.slug) return;

    setSubmitting(true);
    try {
      const payload: ArtisanTrade = {
        id: editingTrade.id || `trade_${Date.now()}`,
        name: editingTrade.name,
        slug: editingTrade.slug,
        icon: editingTrade.icon || 'Wrench',
        description: editingTrade.description || '',
        specialties: editingTrade.specialties || [],
        popular: editingTrade.popular || false,
        active: editingTrade.active !== undefined ? editingTrade.active : true,
      };

      const res = await adminSaveTrade(payload);
      if (res.success) {
        setEditingTrade(null);
        setIsCreating(false);
        onTradesUpdated();
      }
    } catch (err) {
      console.error('Failed to save trade category', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie de métier ?')) return;

    try {
      const res = await adminDeleteTrade(tradeId);
      if (res.success) {
        onTradesUpdated();
      }
    } catch (err) {
      console.error('Failed to delete trade category', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900">Catégories de Métiers</h2>
          <p className="text-xs text-slate-500 font-medium">
            Gérez les corps de métiers disponibles pour les souscriptions d'artisans
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTrade({ name: '', slug: '', active: true, specialties: [] });
            setIsCreating(true);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un métier</span>
        </button>
      </div>

      {(isCreating || editingTrade) && (
        <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            {isCreating ? 'Nouvelle catégorie de métier' : 'Modifier la catégorie'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Métier *</label>
              <input
                type="text"
                required
                value={editingTrade?.name || ''}
                onChange={(e) =>
                  setEditingTrade((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                placeholder="ex: Électricien"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={editingTrade?.slug || ''}
                onChange={(e) => setEditingTrade((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                placeholder="ex: electricien"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={editingTrade?.description || ''}
              onChange={(e) => setEditingTrade((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              placeholder="Description courte des prestations associées..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditingTrade(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trades.map((trade) => (
          <div key={trade.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <Tag className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{trade.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{trade.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingTrade(trade);
                    setIsCreating(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(trade.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium line-clamp-2">
              {trade.description || 'Aucune description spécifiée.'}
            </p>

            {trade.specialties && trade.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {trade.specialties.slice(0, 3).map((spec, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
