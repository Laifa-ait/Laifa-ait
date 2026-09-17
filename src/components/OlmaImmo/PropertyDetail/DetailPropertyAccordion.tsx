import React, { useState, useEffect } from 'react';
import {
  FileText,
  Layers,
  ShieldCheck,
  CreditCard,
  MapPin,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PublicPropertyDTO } from '../../../types/realEstate';
import { DetailTabKey } from './DetailSectionNav';
import { AccordionItem } from './AccordionItem';
import { AccordionRow } from './AccordionRow';
import { findDairaForCommune } from '../../../data/algerianCommunesDatabase';

interface DetailPropertyAccordionProps {
  property: PublicPropertyDTO;
  activeTab?: DetailTabKey;
  onTabChange?: (tab: DetailTabKey) => void;
}

const LEGAL_PAPER_NAMES: Record<string, string> = {
  acte_notarie: "Acte Notarié dans l'Individuel",
  livret_foncier: 'Livret Foncier Individuel',
  dans_indivision: "Acte Notarié dans l'Indivision (Chiyou3)",
  permis_de_construire: 'Permis de Construire Réglementaire',
  papier_timbre: 'Papier Timbré / Acte Sous Seing Privé (Orfi)',
  decision: 'Décision d’Attribution Administrative',
  promesse_vente: 'Promesse de Vente Notariée',
  certificat_conformite: 'Certificat de Conformité APC',
};

export const DetailPropertyAccordion: React.FC<DetailPropertyAccordionProps> = ({
  property,
  activeTab,
  onTabChange,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  useEffect(() => {
    if (!activeTab || activeTab === 'all') return;
    if (activeTab === 'overview') setOpenAccordion('description');
    else if (activeTab === 'legal') setOpenAccordion('legal');
    else if (activeTab === 'finance') setOpenAccordion('finance');
    else if (activeTab === 'location') setOpenAccordion('location');
  }, [activeTab]);

  const toggleAccordion = (section: string) => {
    const next = openAccordion === section ? null : section;
    setOpenAccordion(next);
    if (onTabChange) {
      if (next === 'description' || next === 'specs') onTabChange('overview');
      else if (next === 'legal') onTabChange('legal');
      else if (next === 'finance') onTabChange('finance');
      else if (next === 'location') onTabChange('location');
    }
  };

  const formatDZD = (val: number) =>
    new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(val) + ' DZD';

  const pricePerSqM =
    property.areaSquareMeters && property.areaSquareMeters > 0
      ? Math.round(property.price / property.areaSquareMeters)
      : null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#EAE3D5] overflow-hidden shadow-sm">
      {/* 1: Description / Prestations */}
      <AccordionItem
        id="description"
        title="Description / prestations"
        icon={<FileText className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'description'}
        onToggle={() => toggleAccordion('description')}
      >
        <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
          {property.description ||
            "Découvrez ce bien immobilier soigneusement répertorié sur Olmart Immo. Contactez le vendeur ou planifiez une visite sur place."}
        </p>
        {property.features && property.features.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
              Équipements & Prestations incluses
            </span>
            <div className="flex flex-wrap gap-1.5">
              {property.features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#2C2C28] border border-[#EAE3D5]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#008BB5]" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D5]">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
            {property.propertyType.toUpperCase()} • {property.listingType === 'sale' ? 'VENTE DIRECTE' : 'LOCATION'}
          </span>
          <span className="text-[9px] font-bold text-[#008BB5] uppercase tracking-wider">
            {property.isLegalVerified ? 'Dossier Vérifié' : 'Annonce Vérifiable'}
          </span>
        </div>
      </AccordionItem>

      {/* 2: Caractéristiques / Fiche technique */}
      <AccordionItem
        id="specs"
        title="Caractéristiques / fiche technique"
        icon={<Layers className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'specs'}
        onToggle={() => toggleAccordion('specs')}
      >
        <AccordionRow label="Superficie Habitable" value={`${property.areaSquareMeters} m²`} />
        <AccordionRow
          label="Nombre de pièces"
          value={property.rooms ? `F${property.rooms} (${property.rooms} pièces)` : 'Non spécifié'}
        />
        <AccordionRow label="Salles de bain" value={property.bathrooms || 1} />
        <AccordionRow label="Type de bien" value={<span className="capitalize">{property.propertyType}</span>} />
        <AccordionRow label="Référence / SKU" value={`#${property.id}`} isMono />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          Conseil Olmart : Vérifiez systématiquement la conformité des surfaces et des installations lors de la visite sur site.
        </div>
      </AccordionItem>

      {/* 3: Statut Foncier & Juridique */}
      <AccordionItem
        id="legal"
        title="Documents / statut foncier"
        icon={<ShieldCheck className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'legal'}
        onToggle={() => toggleAccordion('legal')}
      >
        <AccordionRow
          label="Acte de propriété principal"
          value={property.legalPaperType ? (LEGAL_PAPER_NAMES[property.legalPaperType] || property.legalPaperType) : 'Non spécifié'}
        />
        <AccordionRow
          label="Statut du livret foncier"
          value={
            property.legalPapers?.includes('livret_foncier')
              ? 'Livret foncier individuel disponible'
              : 'Non spécifié'
          }
        />
        <AccordionRow
          label="Certification du dossier"
          value={property.isLegalVerified ? 'Dossier vérifié par Olmart' : 'Déclaration sous seing privé'}
        />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          Cadre légal algérien : Tout transfert immobilier est obligatoirement reçu en la forme authentique notariée et publié à la conservation foncière (Loi 75-74).
        </div>
      </AccordionItem>

      {/* 4: Conditions Financières / Règlement */}
      <AccordionItem
        id="finance"
        title="Conditions financières / règlement"
        icon={<CreditCard className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'finance'}
        onToggle={() => toggleAccordion('finance')}
      >
        <AccordionRow label="Prix total annoncé" value={formatDZD(property.price)} />
        {pricePerSqM && <AccordionRow label="Prix au m² calculé" value={`${formatDZD(pricePerSqM)} / m²`} />}
        <AccordionRow
          label="Acompte en ligne"
          value={<span className="text-emerald-700 font-bold">0 DZD (Aucun paiement sur la plateforme)</span>}
        />
        <AccordionRow label="Modalités de règlement" value="Chèque certifié de banque chez le notaire" />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          Règlement sécurisé : Ne versez jamais de caution ou d'acompte financier en espèces avant la signature de l'acte notarié officiel.
        </div>
      </AccordionItem>

      {/* 5: Localisation / Quartier */}
      <AccordionItem
        id="location"
        title="Localisation / quartier & territoire"
        icon={<MapPin className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'location'}
        onToggle={() => toggleAccordion('location')}
        isLast
      >
        <AccordionRow label="Wilaya (Province)" value={property.location.wilaya} />
        <AccordionRow
          label="Daïra (District)"
          value={
            property.location.daira ||
            (property.location.wilaya && property.location.commune
              ? findDairaForCommune(property.location.wilaya, property.location.commune)
              : undefined) ||
            'Non spécifiée'
          }
        />
        <AccordionRow label="Commune / Baladia" value={property.location.commune} />
        {property.location.address && (
          <AccordionRow label="Adresse déclarée" value={property.location.address} />
        )}
        <AccordionRow
          label="Coordonnées GPS"
          value={`${property.location.lat.toFixed(4)}° N, ${property.location.lng.toFixed(4)}° E`}
          isMono
        />
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[10px] text-stone-500 italic">
            Accès immédiat au secteur via cartographie
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D5] text-[#008BB5] font-bold text-[10px] hover:bg-[#FAF6F0] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ouvrir dans Google Maps
          </a>
        </div>
      </AccordionItem>
    </div>
  );
};
