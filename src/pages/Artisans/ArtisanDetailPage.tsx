import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { fetchArtisanById, fetchArtisanReviews } from '../../services/artisan.api';
import { ArtisanProfile, ArtisanReview } from '../../types/artisan';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { QuoteRequestModal } from '../../components/artisans/QuoteRequestModal';
import { ArtisanDetailHero } from '../../components/artisans/detail/ArtisanDetailHero';
import { ArtisanServicesList } from '../../components/artisans/detail/ArtisanServicesList';
import { ArtisanPortfolioGallery } from '../../components/artisans/detail/ArtisanPortfolioGallery';
import { ArtisanReviewsSection } from '../../components/artisans/detail/ArtisanReviewsSection';

export const ArtisanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [reviews, setReviews] = useState<ArtisanReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [artisanData, reviewsData] = await Promise.all([
        fetchArtisanById(id),
        fetchArtisanReviews(id),
      ]);
      setArtisan(artisanData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading artisan detail', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !artisan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-sm font-bold text-slate-700">Artisan introuvable ou indisponible.</p>
        <button
          onClick={() => navigate('/bricolage')}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
        >
          Retour aux artisans
        </button>
      </div>
    );
  }

  return (
    <div id="artisan-detail-page" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ArtisanNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux résultats</span>
        </button>

        <ArtisanDetailHero
          artisan={artisan}
          onRequestQuote={() => setShowQuoteModal(true)}
        />

        <ArtisanServicesList
          services={artisan.services}
          specialties={artisan.specialties}
          onRequestQuote={() => setShowQuoteModal(true)}
        />

        <ArtisanPortfolioGallery portfolio={artisan.portfolio} />

        <ArtisanReviewsSection
          artisanId={artisan.id}
          reviews={reviews}
          rating={artisan.rating}
          reviewCount={artisan.reviewCount}
          onReviewAdded={loadData}
        />
      </main>

      <QuoteRequestModal
        artisan={artisan}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </div>
  );
};
