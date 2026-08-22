import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { LocationPicker } from '../../components/OlmaImmo/LocationPicker';
import {
  Property,
  PropertyType,
  ListingType,
  GeoPointLocation,
} from '../../types/realEstate';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Building2, Plus, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AMENITIES_OPTIONS = [
  'Piscine',
  'Parking',
  'Ascenseur',
  'Vue sur mer',
  'Climatisation',
  'Meublé',
  'Chauffage central',
  'Jardin',
  'Balcon / Terrasse',
  'Garage',
  'Cuisine équipée',
  'Sécurité / Caméras',
];

export const PropertyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [price, setPrice] = useState<number>(100000);
  const [pricePeriod, setPricePeriod] = useState<'night' | 'month' | 'total' | undefined>('total');
  const [areaSquareMeters, setAreaSquareMeters] = useState<number>(100);
  const [rooms, setRooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [location, setLocation] = useState<GeoPointLocation>({
    wilaya: 'Alger',
    commune: 'Bab Ezzouar',
    address: 'Cité universitaire, Bab Ezzouar',
    lat: 36.721,
    lng: 3.183,
  });
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadProperty = async () => {
        setIsLoading(true);
        try {
          const res = await apiGet<{ success: boolean; data?: Property }>(
            `/api/v1/real-estate/properties/${id}`
          );
          if (res.success && res.data) {
            const p = res.data;
            setTitle(p.title);
            setDescription(p.description);
            setPropertyType(p.propertyType);
            setListingType(p.listingType);
            setPrice(p.price);
            setPricePeriod(p.pricePeriod);
            setAreaSquareMeters(p.areaSquareMeters);
            setRooms(p.rooms);
            setBathrooms(p.bathrooms || 1);
            setFeatures(p.features || []);
            setImages(p.images && p.images.length > 0 ? p.images : [
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
            ]);
            setLocation(p.location);
            setStatus(p.status === 'active' || p.status === 'draft' ? p.status : 'active');
          }
        } catch (err) {
          toast.error('Erreur lors du chargement des données du bien');
        } finally {
          setIsLoading(false);
        }
      };
      loadProperty();
    }
  }, [id, isEditMode]);

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput.trim());
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    } catch {
      toast.error('Veuillez saisir une URL d\'image valide (http://... ou https://...)');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      toast.error('Au moins une image est requise pour publier l\'annonce');
      return;
    }
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleFeatureToggle = (feature: string) => {
    if (features.includes(feature)) {
      setFeatures(features.filter((f) => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      toast.error('Le titre doit contenir au moins 5 caractères');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('La description doit contenir au moins 10 caractères');
      return;
    }
    if (price <= 0) {
      toast.error('Le prix doit être supérieur à 0 DZD');
      return;
    }
    if (areaSquareMeters <= 0) {
      toast.error('La superficie doit être supérieure à 0 m²');
      return;
    }
    if (!location.wilaya || !location.commune || !location.address) {
      toast.error('Veuillez remplir les informations de localisation (Wilaya, Commune, Adresse)');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      propertyType,
      listingType,
      price,
      pricePeriod: listingType === 'rent_short' ? 'night' : listingType === 'rent_long' ? 'month' : 'total',
      areaSquareMeters,
      rooms,
      bathrooms,
      features,
      images,
      location,
      status,
    };

    try {
      if (isEditMode && id) {
        const res = await apiPut<{ success: boolean; data?: Property }>(
          `/api/v1/real-estate/properties/${id}`,
          payload
        );
        if (res.success) {
          toast.success('Annonce mise à jour avec succès !');
          navigate('/immo/owner');
        } else {
          toast.error('Erreur lors de la modification');
        }
      } else {
        const res = await apiPost<{ success: boolean; data?: Property }>(
          '/api/v1/real-estate/properties',
          payload
        );
        if (res.success && res.data) {
          toast.success('Annonce immobilière créée avec succès !');
          navigate('/immo/owner');
        } else {
          toast.error('Erreur lors de la création de l\'annonce');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur réseau';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <OlmaImmoNavbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/immo/owner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isEditMode ? 'Modifier l\'annonce' : 'Publier un bien immobilier'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Renseignez les détails précis de votre bien pour attirer les meilleurs acquéreurs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Appartement F4 lumineux avec vue dégagée - Hydra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description détaillée *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Décrivez les atouts de votre bien (proximité transports, écoles, vue, état...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Type and Listing Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Type de bien *
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                >
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="commercial">Local Commercial</option>
                  <option value="land">Terrain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Type de transaction *
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as ListingType)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                >
                  <option value="sale">Vente</option>
                  <option value="rent_long">Location longue durée</option>
                  <option value="rent_short">Séjour courte durée</option>
                </select>
              </div>
            </div>

            {/* Price & Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prix (DZD) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Superficie (m²) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={areaSquareMeters}
                  onChange={(e) => setAreaSquareMeters(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre de pièces
                </label>
                <input
                  type="number"
                  min={0}
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
            </div>

            {/* Location Picker */}
            <LocationPicker location={location} onChange={(newLoc) => setLocation(newLoc)} />

            {/* Amenities Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Équipements & Atouts
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_OPTIONS.map((feat) => {
                  const isChecked = features.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => handleFeatureToggle(feat)}
                      className={`px-3 py-2 rounded-xl text-xs text-start transition-all cursor-pointer border flex items-center gap-2 min-h-[44px] ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {isChecked && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{feat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image URLs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Photos de l'annonce (URLs) *
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Aperçu ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Option */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Visibilité de l'annonce
                </label>
                <p className="text-[11px] text-slate-500">Choisissez de publier immédiatement ou d'enregistrer en brouillon</p>
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              >
                <option value="active">Actif (Publié)</option>
                <option value="draft">Brouillon (Masqué)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer les modifications' : 'Publier l\'annonce'}
            </button>
          </form>
        </div>
      </main>
      <OlmaImmoBottomNav />
    </div>
  );
};
