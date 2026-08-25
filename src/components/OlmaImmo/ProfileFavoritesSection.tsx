import React, { useState, useEffect } from 'react';
import { Heart, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyCard } from './PropertyCard';
import { getFavoritePropertyIds } from '../../utils/realEstateFavorites';
import { apiGet } from '../../lib/api';

export const ProfileFavoritesSection: React.FC = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();

    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('olma_immo:favorites_updated', handleUpdate);
    return () => window.removeEventListener('olma_immo:favorites_updated', handleUpdate);
  }, []);

  const loadFavorites = async () => {
    const ids = getFavoritePropertyIds();
    setFavoriteIds(ids);

    if (ids.length === 0) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch public properties to match favorite ids
      const res = await apiGet<{ success: boolean; data?: Property[] }>('/api/v1/real-estate/properties?limit=50');
      if (res.success && res.data) {
        const matched = res.data.filter((p) => ids.includes(p.id));
        setProperties(matched);
      }
    } catch (err) {
      console.error('Failed to load favorite properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    if (!isFav) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#e8e2d4] text-center">
        <Loader2 className="w-8 h-8 text-[#1e3835] animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-600">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#e8e2d4] text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-[#f4ecd8] text-[#1e3835] flex items-center justify-center mx-auto border border-[#e2d6b5]">
          <Heart className="w-8 h-8 text-[#7a824e]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1e3835]">Vos biens favoris apparaîtront ici</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Vous n'avez pas encore sauvegardé de propriétés. Explorez nos annonces de vente, location et vacances en Algérie.
          </p>
        </div>
        <Link
          to="/immo"
          className="inline-flex items-center gap-2 py-3 px-6 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
        >
          <span>Explorer l'immobilier</span>
          <ArrowRight className="w-4 h-4 text-[#ebdcb8]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">
          {properties.length} bien{properties.length > 1 ? 's' : ''} sauvegardé{properties.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
};
