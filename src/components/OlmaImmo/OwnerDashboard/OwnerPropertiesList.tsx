import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StoredProperty, PropertyStatus } from '../../../types/realEstate';
import { Building2, PlusCircle } from 'lucide-react';
import { OwnerPropertyCard } from '../OwnerPropertyCard';
import { OlmaButton, OlmaSurface } from '../primitives';

interface OwnerPropertiesListProps {
  properties: StoredProperty[];
  isLoading: boolean;
  onUpdateStatus: (propertyId: string, status: PropertyStatus) => void;
  onDeleteProperty?: (propertyId: string, title: string) => void;
}

export const OwnerPropertiesList: React.FC<OwnerPropertiesListProps> = ({
  properties,
  isLoading,
  onUpdateStatus,
  onDeleteProperty,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');

  const filteredProperties = properties.filter((p) => {
    if (selectedStatusTab === 'all') return true;
    return p.status === selectedStatusTab;
  });

  return (
    <OlmaSurface
      variant="default"
      elevation="card"
      padding="lg"
      className="rounded-3xl border border-[#e8e2d4] shadow-xs space-y-6"
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#f0eae0]">
        {[
          { id: 'all', label: 'Toutes les annonces', count: properties.length },
          { id: 'active', label: 'En ligne', count: properties.filter((p) => p.status === 'active').length },
          { id: 'pending', label: 'En vérification', count: properties.filter((p) => p.status === 'pending').length },
          { id: 'paused', label: 'En pause', count: properties.filter((p) => p.status === 'paused').length },
        ].map((tab) => {
          const isActive = selectedStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#1a3831] text-[#ebdcb8] shadow-xs'
                  : 'bg-[#faf8f5] text-slate-600 hover:bg-[#f0eae0]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-[#ebdcb8] text-[#1a3831]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
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
          <h3 className="text-base font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Aucune annonce dans cet état
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Publiez dès aujourd'hui votre premier bien immobilier pour toucher des milliers d'acquéreurs.
          </p>
          <OlmaButton
            as={Link}
            to="/immo/publish"
            variant="primary"
            size="md"
            radius="xl"
            className="mt-2"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Déposer une annonce</span>
          </OlmaButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProperties.map((property) => (
            <OwnerPropertyCard
              key={property.id}
              property={property}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDeleteProperty}
            />
          ))}
        </div>
      )}
    </OlmaSurface>
  );
};

