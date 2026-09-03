import React from 'react';
import { ListingType, PropertyType, LegalPaperType } from '../../../types/realEstate';
import { Building2, Home, Layers, Compass, Grid } from 'lucide-react';
import { EditorStepLegalPapers } from './EditorStepLegalPapers';

interface EditorStepTransactionProps {
  listingType: ListingType;
  setListingType: (type: ListingType) => void;
  propertyType: PropertyType;
  setPropertyType: (type: PropertyType) => void;
  legalPaperType?: LegalPaperType;
  setLegalPaperType?: (paperType: LegalPaperType) => void;
  legalPapers?: LegalPaperType[];
  setLegalPapers?: (papers: LegalPaperType[]) => void;
}

const PROPERTY_TYPES: { type: PropertyType; title: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'apartment', title: 'Appartement', description: 'F2, F3, F4, Duplex, Penthouse en résidence', icon: Building2 },
  { type: 'villa', title: 'Villa', description: 'Villa individuelle, demeure coloniale, propriété', icon: Home },
  { type: 'house', title: 'Maison', description: 'Maison traditionnelle, niveau de villa', icon: Home },
  { type: 'studio', title: 'Studio', description: 'Studio meublé ou vide pour célibataire / couple', icon: Layers },
  { type: 'commercial', title: 'Local Commercial', description: 'Boutique, magasin, show-room, entrepôt', icon: Grid },
  { type: 'land', title: 'Terrain', description: 'Terrain constructible, agricole ou industriel', icon: Compass },
  { type: 'office', title: 'Bureau', description: 'Espace de travail professionnel, plateau bureau', icon: Building2 },
  { type: 'building', title: 'Immeuble', description: 'Immeuble R+3, R+4 complet à vendre / louer', icon: Building2 },
];

export const EditorStepTransaction: React.FC<EditorStepTransactionProps> = ({
  listingType,
  setListingType,
  propertyType,
  setPropertyType,
  legalPaperType = 'acte_notarie_individuel',
  setLegalPaperType,
  legalPapers,
  setLegalPapers,
}) => {
  const activePapers: LegalPaperType[] = legalPapers && legalPapers.length > 0
    ? legalPapers
    : (legalPaperType ? [legalPaperType] : ['acte_notarie_individuel']);

  const handleTogglePaper = (paperType: LegalPaperType) => {
    if (setLegalPapers) {
      const exists = activePapers.includes(paperType);
      let updated: LegalPaperType[];
      if (exists) {
        updated = activePapers.filter((p) => p !== paperType);
        if (updated.length === 0) updated = [paperType];
      } else {
        updated = [...activePapers, paperType];
      }
      setLegalPapers(updated);
      if (setLegalPaperType && updated.length > 0) {
        setLegalPaperType(updated[0]);
      }
    } else if (setLegalPaperType) {
      setLegalPaperType(paperType);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-8">
      {/* Transaction Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Type de Transaction
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choisissez la nature commerciale de votre annonce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'sale' as ListingType, title: 'Vente Immobilière', desc: 'Vendre un bien ou un terrain avec acte & livret' },
            { id: 'rent_long' as ListingType, title: 'Location Longue Durée', desc: 'Contrat de bail 6 mois, 1 an ou plus' },
            { id: 'rent_short' as ListingType, title: 'Séjour & Vacances', desc: 'Location meublée par nuitée pour voyageurs' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setListingType(item.id)}
              className={`p-5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                listingType === item.id
                  ? 'border-[#1a3831] bg-[#faf8f5] shadow-xs'
                  : 'border-[#e8e2d4] hover:border-slate-300 bg-white'
              }`}
            >
              <span className={`text-sm font-bold ${listingType === item.id ? 'text-[#1a3831]' : 'text-slate-800'}`}>
                {item.title}
              </span>
              <span className="text-xs text-slate-500 leading-relaxed">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Situation Juridique & Documents du Bien (Le Pilier "Papiers Fonciers DZ") */}
      <EditorStepLegalPapers
        activePapers={activePapers}
        onTogglePaper={handleTogglePaper}
      />

      {/* Property Category */}
      <div className="space-y-4 pt-6 border-t border-[#f0eae0]">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Catégorie du Bien
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sélectionnez la typologie exacte pour orienter au mieux les recherches.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {PROPERTY_TYPES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = propertyType === cat.type;

            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => setPropertyType(cat.type)}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col space-y-2 ${
                  isSelected
                    ? 'border-[#1a3831] bg-[#f4ecd8]/60 shadow-xs'
                    : 'border-[#e8e2d4] hover:border-slate-300 bg-[#faf8f5]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-[#1a3831] text-[#ebdcb8]' : 'bg-white text-slate-700 border border-[#e8e2d4]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold ${isSelected ? 'text-[#1a3831]' : 'text-slate-800'}`}>
                  {cat.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
