import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ArtisanTrade } from '../../../types/artisan';
import { adminSaveTrade, adminDeleteTrade } from '../../../services/artisan.api';

interface AdminTradesManagerProps {
  trades: ArtisanTrade[];
  onTradesUpdated: () => Promise<void>;
}

export const AdminTradesManager: React.FC<AdminTradesManagerProps> = ({
  trades,
  onTradesUpdated,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tradeName, setTradeName] = useState('');
  const [tradeSlug, setTradeSlug] = useState('');
  const [tradeDesc, setTradeDesc] = useState('');
  const [tradeSpecialtiesStr, setTradeSpecialtiesStr] = useState('');
  const [savingTrade, setSavingTrade] = useState(false);

  const handleSaveTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeName.trim() || !tradeSlug.trim()) return;

    setSavingTrade(true);
    try {
      const specialties = tradeSpecialtiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await adminSaveTrade({
        id: `trade_${tradeSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: tradeName.trim(),
        slug: tradeSlug.trim().toLowerCase(),
        description: tradeDesc.trim(),
        icon: 'Wrench',
        specialties,
        popular: false,
        isActive: true,
      });

      if (res.success) {
        setShowModal(false);
        setTradeName('');
        setTradeSlug('');
        setTradeDesc('');
        setTradeSpecialtiesStr('');
        await onTradesUpdated();
      }
    } finally {
      setSavingTrade(false);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!window.confirm('Supprimer cette catégorie de métier ?')) return;
    await adminDeleteTrade(tradeId);
    await onTradesUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">Catégories de Métiers Référencées</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un métier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trades.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {t.slug}
                </span>
                <button
                  onClick={() => handleDeleteTrade(t.id)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
            </div>

            {t.specialties && t.specialties.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {t.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Créer une catégorie de métier</h3>
            <form onSubmit={handleSaveTrade} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nom du métier *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ferronnerie & Soudure"
                  value={tradeName}
                  onChange={(e) => {
                    setTradeName(e.target.value);
                    if (!tradeSlug) {
                      setTradeSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')
                          .replace(/-+/g, '-')
                      );
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Slug unique *</label>
                <input
                  type="text"
                  required
                  placeholder="ferronnerie"
                  value={tradeSlug}
                  onChange={(e) => setTradeSlug(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={tradeDesc}
                  onChange={(e) => setTradeDesc(e.target.value)}
                  placeholder="Prestations associées..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Spécialités (séparées par virgules)
                </label>
                <input
                  type="text"
                  placeholder="Grilles de fenêtre, portails métalliques"
                  value={tradeSpecialtiesStr}
                  onChange={(e) => setTradeSpecialtiesStr(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingTrade}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  {savingTrade ? 'Enregistrement...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
