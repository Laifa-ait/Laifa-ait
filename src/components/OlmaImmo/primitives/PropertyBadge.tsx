import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OlmaPill, OlmaPillSize } from './OlmaPill';
import { getLegalPaperInfo } from '../../../constants/legalPapers';
import { LegalPaperType, ListingType, PropertyStatus, BookingStatus } from '../../../types/realEstate';

export type PropertyBadgeType =
  | 'listingType'
  | 'legalPaper'
  | 'status'
  | 'bookingStatus'
  | 'verified'
  | 'custom';

export interface PropertyBadgeProps {
  type: PropertyBadgeType;
  value?: string;
  size?: OlmaPillSize;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export const PropertyBadge: React.FC<PropertyBadgeProps> = ({
  type,
  value,
  size = 'sm',
  dot = false,
  className = '',
  children,
  id,
}) => {
  if (type === 'listingType') {
    const listing = (value || '') as ListingType;
    let label = children || 'Vente';
    let variant: 'brand' | 'accent' | 'highlight' = 'brand';

    switch (listing) {
      case 'sale':
        label = children || 'Vente';
        variant = 'brand';
        break;
      case 'rent_long':
        label = children || 'Location';
        variant = 'accent';
        break;
      case 'rent_short':
        label = children || 'Séjour';
        variant = 'highlight';
        break;
    }

    return (
      <OlmaPill id={id} variant={variant} size={size} dot={dot} className={`uppercase tracking-wider font-bold ${className}`}>
        {label}
      </OlmaPill>
    );
  }

  if (type === 'legalPaper') {
    const paperInfo = getLegalPaperInfo(value as LegalPaperType);
    if (!paperInfo) {
      return (
        <OlmaPill id={id} variant="neutral" size={size} className={className}>
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{children || value}</span>
        </OlmaPill>
      );
    }

    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1 font-bold rounded-full border shadow-2xs ${
          size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
        } ${paperInfo.badgeBg} ${paperInfo.badgeText} ${paperInfo.badgeBorder} ${className}`}
        title={paperInfo.description}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{children || paperInfo.shortLabel || paperInfo.label}</span>
      </span>
    );
  }

  if (type === 'verified') {
    return (
      <OlmaPill id={id} variant="success" size={size} dot={dot} className={className}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>{children || 'Dossier Vérifié'}</span>
      </OlmaPill>
    );
  }

  if (type === 'status') {
    const s = (value || '') as PropertyStatus;
    switch (s) {
      case 'active':
        return <OlmaPill id={id} variant="success" size={size} dot className={className}>{children || 'En ligne'}</OlmaPill>;
      case 'pending':
        return <OlmaPill id={id} variant="warning" size={size} dot className={className}>{children || 'En vérification'}</OlmaPill>;
      case 'paused':
        return <OlmaPill id={id} variant="neutral" size={size} className={className}>{children || 'En pause'}</OlmaPill>;
      case 'rented':
        return <OlmaPill id={id} variant="info" size={size} className={className}>{children || 'Loué'}</OlmaPill>;
      case 'sold':
        return <OlmaPill id={id} variant="accent" size={size} className={className}>{children || 'Vendu'}</OlmaPill>;
      case 'archived':
        return <OlmaPill id={id} variant="danger" size={size} className={className}>{children || 'Archivé'}</OlmaPill>;
      default:
        return <OlmaPill id={id} variant="neutral" size={size} className={`capitalize ${className}`}>{children || s}</OlmaPill>;
    }
  }

  if (type === 'bookingStatus') {
    const bs = (value || '') as BookingStatus;
    switch (bs) {
      case 'confirmed':
        return <OlmaPill id={id} variant="success" size={size} dot className={className}>{children || 'Séjour Confirmé'}</OlmaPill>;
      case 'pending':
        return <OlmaPill id={id} variant="warning" size={size} dot className={className}>{children || 'En attente'}</OlmaPill>;
      case 'cancelled':
        return <OlmaPill id={id} variant="danger" size={size} className={className}>{children || 'Annulée'}</OlmaPill>;
      case 'rejected':
        return <OlmaPill id={id} variant="neutral" size={size} className={className}>{children || 'Non acceptée'}</OlmaPill>;
      case 'completed':
        return <OlmaPill id={id} variant="info" size={size} className={className}>{children || 'Séjour Terminé'}</OlmaPill>;
      default:
        return <OlmaPill id={id} variant="neutral" size={size} className={`capitalize ${className}`}>{children || bs}</OlmaPill>;
    }
  }

  return (
    <OlmaPill id={id} variant="neutral" size={size} dot={dot} className={className}>
      {children}
    </OlmaPill>
  );
};
