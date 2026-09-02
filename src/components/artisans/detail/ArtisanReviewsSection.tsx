import React, { useState } from 'react';
import { Star, MessageSquare, Plus } from 'lucide-react';
import { ArtisanReview } from '../../../types/artisan';
import { addArtisanReview } from '../../../services/artisan.api';
import { useAuth } from '../../../context/AuthContext';

interface ArtisanReviewsSectionProps {
  artisanId: string;
  reviews: ArtisanReview[];
  rating?: number;
  reviewCount: number;
  onReviewAdded: () => Promise<void>;
}

export const ArtisanReviewsSection: React.FC<ArtisanReviewsSectionProps> = ({
  artisanId,
  reviews,
  reviewCount,
  onReviewAdded,
}) => {
  const { currentUser, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Veuillez vous connecter pour laisser un avis.');
      return;
    }

    setSubmitting(true);
    try {
      await addArtisanReview(artisanId, {
        rating: newRating,
        comment: comment.trim(),
        userName: user?.displayName || currentUser.email || 'Client vérifié',
      });
      setShowAddForm(false);
      setComment('');
      await onReviewAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-black text-slate-900">
            Avis & Évaluations ({reviewCount})
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Laisser un avis</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Votre note *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 text-amber-500 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${star <= newRating ? 'fill-amber-500' : 'stroke-slate-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">Votre commentaire</label>
            <textarea
              rows={2}
              required
              placeholder="Qualité du travail, ponctualité, propreté du chantier..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer shadow-xs"
            >
              {submitting ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">{rev.clientName}</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-4">
            Aucun avis déposé pour le moment. Soyez le premier à donner votre avis !
          </p>
        )}
      </div>
    </div>
  );
};
