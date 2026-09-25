import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

export const DetailPropertyAccordion: React.FC<DetailPropertyAccordionProps> = ({
  property,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  const getLegalPaperName = (key: string): string => {
    switch (key) {
      case 'acte_notarie': return t('immo_paper_acte_notarie', "Acte Notarié dans l'Individuel");
      case 'livret_foncier': return t('immo_paper_livret_foncier', 'Livret Foncier Individuel');
      case 'dans_indivision': return t('immo_paper_dans_indivision', "Acte Notarié dans l'Indivision (Chiyou3)");
      case 'permis_de_construire': return t('immo_paper_permis_de_construire', 'Permis de Construire Réglementaire');
      case 'papier_timbre': return t('immo_paper_papier_timbre', 'Papier Timbré / Acte Sous Seing Privé (Orfi)');
      case 'decision': return t('immo_paper_decision', 'Décision d’Attribution Administrative');
      case 'promesse_vente': return t('immo_paper_promesse_vente', 'Promesse de Vente Notariée');
      case 'certificat_conformite': return t('immo_paper_certificat_conformite', 'Certificat de Conformité APC');
      default: return key;
    }
  };

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
        title={t('immo_acc_desc_title', 'Description / prestations')}
        icon={<FileText className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'description'}
        onToggle={() => toggleAccordion('description')}
      >
        <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
          {property.description ||
            t('immo_acc_desc_default', 'Découvrez ce bien immobilier soigneusement répertorié sur Olmart Immo. Contactez le vendeur ou planifiez une visite sur place.')}
        </p>
        {property.features && property.features.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
              {t('immo_acc_amenities_included', 'Équipements & Prestations incluses')}
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
            {property.propertyType.toUpperCase()} • {property.listingType === 'sale' ? t('immo_acc_direct_sale', 'VENTE DIRECTE') : t('immo_acc_rent', 'LOCATION')}
          </span>
          <span className="text-[9px] font-bold text-[#008BB5] uppercase tracking-wider">
            {property.isLegalVerified ? t('immo_acc_verified_file', 'Dossier Vérifié') : t('immo_acc_verifiable_ad', 'Annonce Vérifiable')}
          </span>
        </div>
      </AccordionItem>

      {/* 2: Caractéristiques / Fiche technique */}
      <AccordionItem
        id="specs"
        title={t('immo_acc_specs_title', 'Caractéristiques / fiche technique')}
        icon={<Layers className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'specs'}
        onToggle={() => toggleAccordion('specs')}
      >
        <AccordionRow label={t('immo_acc_living_area', 'Superficie Habitable')} value={`${property.areaSquareMeters} m²`} />
        <AccordionRow
          label={t('immo_acc_room_count', 'Nombre de pièces')}
          value={property.rooms ? `F${property.rooms} (${property.rooms} pièces)` : t('immo_acc_unspecified', 'Non spécifié')}
        />
        <AccordionRow label={t('immo_acc_bathrooms', 'Salles de bain')} value={property.bathrooms || 1} />
        <AccordionRow label={t('immo_acc_prop_type', 'Type de bien')} value={<span className="capitalize">{property.propertyType}</span>} />
        <AccordionRow label={t('immo_acc_ref_sku', 'Référence / SKU')} value={`#${property.id}`} isMono />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          {t('immo_acc_specs_advice', 'Conseil Olmart : Vérifiez systématiquement la conformité des surfaces et des installations lors de la visite sur site.')}
        </div>
      </AccordionItem>

      {/* 3: Statut Foncier & Juridique */}
      <AccordionItem
        id="legal"
        title={t('immo_acc_legal_title', 'Documents / statut foncier')}
        icon={<ShieldCheck className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'legal'}
        onToggle={() => toggleAccordion('legal')}
      >
        <AccordionRow
          label={t('immo_acc_main_deed', 'Acte de propriété principal')}
          value={property.legalPaperType ? getLegalPaperName(property.legalPaperType) : t('immo_acc_unspecified', 'Non spécifié')}
        />
        <AccordionRow
          label={t('immo_acc_land_registry_status', 'Statut du livret foncier')}
          value={
            property.legalPapers?.includes('livret_foncier')
              ? t('immo_acc_land_registry_avail', 'Livret foncier individuel disponible')
              : t('immo_acc_unspecified', 'Non spécifié')
          }
        />
        <AccordionRow
          label={t('immo_acc_file_certification', 'Certification du dossier')}
          value={property.isLegalVerified ? t('immo_acc_verified_by_olmart', 'Dossier vérifié par Olmart') : t('immo_acc_private_deed', 'Déclaration sous seing privé')}
        />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          {t('immo_acc_legal_framework', 'Cadre légal algérien : Tout transfert immobilier est obligatoirement reçu en la forme authentique notariée et publié à la conservation foncière (Loi 75-74).')}
        </div>
      </AccordionItem>

      {/* 4: Conditions Financières / Règlement */}
      <AccordionItem
        id="finance"
        title={t('immo_acc_finance_title', 'Conditions financières / règlement')}
        icon={<CreditCard className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'finance'}
        onToggle={() => toggleAccordion('finance')}
      >
        <AccordionRow label={t('immo_acc_total_price', 'Prix total annoncé')} value={formatDZD(property.price)} />
        {pricePerSqM && <AccordionRow label={t('immo_acc_price_per_sqm', 'Prix au m² calculé')} value={`${formatDZD(pricePerSqM)} / m²`} />}
        <AccordionRow
          label={t('immo_acc_online_deposit', 'Acompte en ligne')}
          value={<span className="text-emerald-700 font-bold">{t('immo_acc_zero_online_payment', '0 DZD (Aucun paiement sur la plateforme)')}</span>}
        />
        <AccordionRow label={t('immo_acc_payment_terms', 'Modalités de règlement')} value={t('immo_acc_certified_check', 'Chèque certifié de banque chez le notaire')} />
        <div className="pt-2 text-[10px] text-stone-500 italic">
          {t('immo_acc_secure_payment_tip', "Règlement sécurisé : Ne versez jamais de caution ou d'acompte financier en espèces avant la signature de l'acte notarié officiel.")}
        </div>
      </AccordionItem>

      {/* 5: Localisation / Quartier */}
      <AccordionItem
        id="location"
        title={t('immo_acc_location_title', 'Localisation / quartier & territoire')}
        icon={<MapPin className="w-4 h-4 text-[#008BB5]" />}
        isOpen={openAccordion === 'location'}
        onToggle={() => toggleAccordion('location')}
        isLast
      >
        <AccordionRow label={t('immo_acc_wilaya', 'Wilaya (Province)')} value={property.location.wilaya} />
        <AccordionRow
          label={t('immo_acc_daira', 'Daïra (District)')}
          value={
            property.location.daira ||
            (property.location.wilaya && property.location.commune
              ? findDairaForCommune(property.location.wilaya, property.location.commune)
              : undefined) ||
            t('immo_acc_unspecified', 'Non spécifiée')
          }
        />
        <AccordionRow label={t('immo_acc_commune', 'Commune / Baladia')} value={property.location.commune} />
        {property.location.address && (
          <AccordionRow label={t('immo_acc_declared_address', 'Adresse déclarée')} value={property.location.address} />
        )}
        <AccordionRow
          label={t('immo_acc_gps_coords', 'Coordonnées GPS')}
          value={`${property.location.lat.toFixed(4)}° N, ${property.location.lng.toFixed(4)}° E`}
          isMono
        />
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[10px] text-stone-500 italic">
            {t('immo_acc_map_access', 'Accès immédiat au secteur via cartographie')}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE3D5] text-[#008BB5] font-bold text-[10px] hover:bg-[#FAF6F0] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {t('immo_acc_open_gmaps', 'Ouvrir dans Google Maps')}
          </a>
        </div>
      </AccordionItem>
    </div>
  );
};
