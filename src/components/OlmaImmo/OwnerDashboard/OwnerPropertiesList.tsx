import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property, PropertyStatus } from '../../../types/realEstate';
import {
  Building2,
  PlusCircle,
  Eye,
  Edit,
  PauseCircle,
  PlayCircle,
  Archive,
  MapPin,
  MoreVertical,
} from 'lucide-react';

interface OwnerPropertiesListProps {
  properties: Property[];
  isLoading: boolean;
  onUpdateStatus: (propertyId: string, status: PropertyStatus) => void;
}

export const OwnerPropertiesList: React.FC<OwnerPropertiesListProps> = ({
  properties,
  isLoading,
  onUpdateStatus,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProperties = properties.filter((p) => {
    if (selectedStatusTab === 'all') return true;
    return p.status === selectedStatusTab;
  });

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">En ligne</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">En modération</span>;
      case 'paused':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full border border-slate-200">En pause</span>;
      case 'rented':
      case 'sold':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">Conclu</span>;
      case 'archived':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-800 text-[11px] font-bold rounded-full border border-rose-200">Archivé</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full capitalize">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#f0eae0]">
        {[
          { id: 'all', label: 'Toutes les annonces', count: properties.length },
          { id: 'active', label: 'En ligne', count: properties.filter((p) => p.status === 'active').length },
          { id: 'pending', label: 'En vérification', count: properties.filter((p) => p.status === 'pending').length },
          { id: 'paused', label: 'En pause', count: properties.filter((p) => p.status === 'paused').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatusTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              selectedStatusTab === tab.id
                ? 'bg-[#1a3831] text-[#ebdcb8]'
                : 'bg-[#faf8f5] text-slate-600 hover:bg-[#f0eae0]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              selectedStatusTab === tab.id ? 'bg-[#ebdcb8] text-[#1a3831]' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold animate-pulse">
          Chargement de vos annonces...
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1a3831]">Aucune annonce dans cet état</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Publiez dès aujourd'hui votre premier bien immobilier pour toucher des milliers d'acquéreurs.
          </p>
          <Link
            to="/immo/publish"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#1a3831] text-[#ebdcb8] font-bold text-xs rounded-xl uppercase tracking-wider mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Déposer une annonce</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] overflow-hidden hover:shadow-md transition flex flex-col group relative"
            >
              <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                <img
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3">{getStatusBadge(property.status)}</div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {property.listingType === 'sale' ? 'Vente' : property.listingType === 'rent_long' ? 'Location' : 'Séjour'}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-[#1a3831] text-sm line-clamp-1">{property.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>{property.location.commune}, {property.location.wilaya}</span>
                  </p>
                  <div className="text-base font-black text-[#1a3831] mt-2">
                    {new Intl.NumberFormat('fr-DZ').format(property.price)} DA
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e8e2d4] flex items-center justify-between gap-2">
                  <Link
                    to={`/immo/property/${property.id}`}
                    className="p-2 bg-white border border-[#e8e2d4] rounded-xl text-slate-700 hover:text-[#1a3831] text-xs font-bold flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir</span>
                  </Link>

                  <Link
                    to={`/immo/edit/${property.id}`}
                    className="p-2 bg-[#f4ecd8] border border-[#ebdcb8] rounded-xl text-[#1a3831] text-xs font-bold flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </Link>

                  {property.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(property.id, 'paused')}
                      className="p-2 bg-white border border-[#e8e2d4] rounded-xl text-slate-500 hover:text-amber-700"
                      title="Mettre en pause"
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(property.id, 'active')}
                      className="p-2 bg-white border border-[#e8e2d4] rounded-xl text-slate-500 hover:text-emerald-700"
                      title="Activer"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
