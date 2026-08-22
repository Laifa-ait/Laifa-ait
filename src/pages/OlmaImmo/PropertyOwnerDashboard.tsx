import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { Property, PropertyStatus } from '../../types/realEstate';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  PlusCircle,
  Eye,
  Edit,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PropertyOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, openAuthModal } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnablingCapability, setIsEnablingCapability] = useState(false);

  const userCapabilities = (userProfile as { capabilities?: string[] })?.capabilities || [];
  const isOwner =
    userProfile?.role === 'admin' ||
    userProfile?.role === 'seller' ||
    userCapabilities.includes('property_owner');

  const fetchOwnerProperties = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet<{ success: boolean; data?: Property[] }>(
        '/api/v1/real-estate/owner/properties'
      );
      if (response.success && response.data) {
        setProperties(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch owner properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isOwner) {
      fetchOwnerProperties();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, isOwner]);

  const handleEnableOwnerRole = async () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else navigate('/auth');
      return;
    }

    setIsEnablingCapability(true);
    try {
      const res = await apiPost<{ success: boolean; message?: string }>('/api/v1/real-estate/owner/enable', {});
      if (res.success) {
        toast.success('Rôle de propriétaire immobilier activé avec succès !');
        window.location.reload();
      } else {
        toast.error('Erreur lors de l\'activation du rôle');
      }
    } catch (err) {
      toast.error('Erreur lors de la demande');
    } finally {
      setIsEnablingCapability(false);
    }
  };

  const handleUpdateStatus = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      const response = await apiPut<{ success: boolean; data?: Property }>(
        `/api/v1/real-estate/properties/${propertyId}`,
        { status: newStatus }
      );
      if (response.success) {
        toast.success(`Statut mis à jour: ${newStatus}`);
        fetchOwnerProperties();
      } else {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    } catch (err) {
      toast.error('Erreur serveur');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <UserCheck className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Espace Propriétaire Immobilier</h2>
          <p className="text-xs text-slate-500">
            Connectez-vous à votre compte Olmart pour accéder à la gestion de vos biens immobiliers.
          </p>
          <button
            onClick={() => (openAuthModal ? openAuthModal() : navigate('/auth'))}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Devenir Propriétaire sur Olma Immo</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Publiez gratuitement vos annonces immobilières (ventes, locations longues durées, séjours) et touchez des milliers d'acheteurs et locataires en Algérie.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-start space-y-3 text-xs text-slate-700 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Publication d'annonces avec photos illimitées</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Géolocalisation précise sur carte interactive</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Gestion des demandes de visites et réservations</span>
            </div>
          </div>

          <button
            onClick={handleEnableOwnerRole}
            disabled={isEnablingCapability}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {isEnablingCapability ? 'Activation en cours...' : 'Activer gratuitement mon accès Propriétaire'}
          </button>
        </div>
      </div>
    );
  }

  const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const activeCount = properties.filter((p) => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <OlmaImmoNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Tableau de bord Propriétaire</h1>
            <p className="text-xs text-slate-500 mt-1">Gérez vos biens publiés et suivez leurs statistiques</p>
          </div>

          <Link
            to="/immo/publish"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publier une nouvelle annonce</span>
          </Link>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Biens</span>
              <span className="text-2xl font-extrabold text-slate-900">{properties.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Annonces Actives</span>
              <span className="text-2xl font-extrabold text-emerald-700">{activeCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Vues</span>
              <span className="text-2xl font-extrabold text-slate-900">{totalViews}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Properties List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Vous n'avez pas encore d'annonce publiée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mettez en valeur votre appartement, villa, local ou terrain en créant votre première annonce.
            </p>
            <Link
              to="/immo/publish"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Créer mon annonce
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
              Vos annonces ({properties.length})
            </div>

            <div className="divide-y divide-slate-100">
              {properties.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                      alt={p.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.status}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {p.location.commune}, {p.location.wilaya}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h3>
                      <p className="text-emerald-700 font-extrabold text-xs mt-1">
                        {p.price.toLocaleString('fr-DZ')} DA
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 ms-auto">
                    <Link
                      to={`/immo/property/${p.id}`}
                      className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Voir la fiche"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/immo/edit/${p.id}`}
                      className="p-2.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <select
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value as PropertyStatus)}
                      className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                    >
                      <option value="active">Actif</option>
                      <option value="draft">Brouillon</option>
                      <option value="rented">Loué</option>
                      <option value="sold">Vendu</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <OlmaImmoBottomNav />
    </div>
  );
};
