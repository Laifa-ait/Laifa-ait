import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Compass, Navigation, ExternalLink, ShieldCheck, School, ShoppingBag, Stethoscope, Waves, Bus, Eye } from 'lucide-react';
import { GeoPointLocation, Property, PropertyMapResult } from '../../../types/realEstate';
import { InteractiveMap } from '../InteractiveMap';
import { NeighborPriceBarometer } from './NeighborPriceBarometer';
import { NeighborPropertyModal } from './NeighborPropertyModal';
import { apiGet } from '../../../lib/api';

interface DetailLocationProps {
  location: GeoPointLocation;
  title: string;
  price: number;
  currentPropertyId?: string;
  similarProperties?: Property[];
}

const NEIGHBORHOOD_AMENITIES = [
  { icon: ShoppingBag, label: 'Supermarchés & Supérettes', distance: '350 m' },
  { icon: School, label: 'Écoles primaires & Lycées', distance: '600 m' },
  { icon: Bus, label: 'Arrêt de bus & Station Tramway', distance: '400 m' },
  { icon: Stethoscope, label: 'Pharmacie de garde & Clinique', distance: '500 m' },
  { icon: Waves, label: 'Corniche & Vue littorale', distance: '1.2 km' },
];

export const DetailLocation: React.FC<DetailLocationProps> = ({
  location,
  title,
  price,
  currentPropertyId = 'current-property',
  similarProperties = [],
}) => {
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [showNeighbors, setShowNeighbors] = useState<boolean>(true);
  const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null);
  const [extraNeighbors, setExtraNeighbors] = useState<Property[]>([]);

  // Fetch additional neighboring properties in the same Wilaya if needed
  useEffect(() => {
    if (location.wilaya) {
      apiGet<{ success: boolean; data?: Property[] }>(
        `/api/v1/real-estate/properties?wilaya=${encodeURIComponent(location.wilaya)}&limit=10`
      )
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const filtered = res.data.filter((p) => p.id !== currentPropertyId);
            setExtraNeighbors(filtered);
          }
        })
        .catch(() => {
          // Non-blocking fallback
        });
    }
  }, [location.wilaya, currentPropertyId]);

  // Combine similarProperties and extraNeighbors (deduplicated)
  const allNeighbors = useMemo(() => {
    const map = new Map<string, Property>();
    similarProperties.forEach((p) => {
      if (p.id !== currentPropertyId) map.set(p.id, p);
    });
    extraNeighbors.forEach((p) => {
      if (p.id !== currentPropertyId && !map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [similarProperties, extraNeighbors, currentPropertyId]);

  const mapProperty: PropertyMapResult = useMemo(
    () => ({
      id: currentPropertyId,
      title,
      propertyType: 'apartment',
      listingType: 'sale',
      price,
      lat: location.lat || 36.7538,
      lng: location.lng || 3.0588,
      commune: location.commune || 'Alger Centre',
      wilaya: location.wilaya || 'Alger',
      mainImage: '',
      rooms: 0,
      areaSquareMeters: 0,
    }),
    [currentPropertyId, title, price, location.lat, location.lng, location.commune, location.wilaya]
  );

  const mapPropertiesToDisplay = useMemo(() => {
    if (!showNeighbors) {
      return [mapProperty];
    }
    return [mapProperty, ...allNeighbors];
  }, [showNeighbors, mapProperty, allNeighbors]);

  const selectedNeighbor = allNeighbors.find((n) => n.id === selectedNeighborId);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapProperty.lat},${mapProperty.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${mapProperty.lat},${mapProperty.lng}&navigate=yes`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E0D4] shadow-[0_4px_24px_rgba(26,56,49,0.04)] space-y-6">
      {/* Header section with Location, Status and Wilaya */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-extrabold text-[#0D281E] flex items-center gap-2.5 font-['Playfair_Display',serif]">
            <span className="w-9 h-9 rounded-xl bg-[#0D281E] text-[#EBDCB8] flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </span>
            <span>Emplacement & Quartier</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            {location.commune}, Wilaya de {location.wilaya} (Algérie)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secteur Vérifié</span>
          </span>
          <span className="text-xs font-bold text-[#0D281E] flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200/60">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>{location.wilaya}</span>
          </span>
        </div>
      </div>

      {/* Luxury Map Container with Unobstructed Controls & Neighbor Comparison */}
      <div className="relative rounded-2xl overflow-hidden border border-[#DDD6C8] shadow-inner bg-[#F5EFE6] h-[400px] sm:h-[480px]">
        <InteractiveMap
          properties={mapPropertiesToDisplay}
          selectedPropertyId={selectedNeighborId || undefined}
          highlightPropertyId={currentPropertyId}
          onSelectProperty={(id) => setSelectedNeighborId(id && id !== currentPropertyId ? id : null)}
          showFilters={false}
          showPreviewCard={false}
          centerLat={mapProperty.lat}
          centerLng={mapProperty.lng}
          zoom={14}
          allowFullscreenToggle={true}
          className="w-full h-full"
        />

        {/* Elegant top-left info pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 shadow-md text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-emerald-600" />
            <span>GPS: {mapProperty.lat.toFixed(4)}, {mapProperty.lng.toFixed(4)}</span>
          </div>

          {allNeighbors.length > 0 && showNeighbors && (
            <div className="bg-[#0D281E]/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#EBDCB8] flex items-center gap-1 shadow-sm">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>{allNeighbors.length} biens voisins affichés</span>
            </div>
          )}
        </div>

        {/* Floating Neighbor Property Details Popover when a neighbor pin is clicked */}
        {selectedNeighbor && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:bottom-3 z-40 max-w-sm pointer-events-auto">
            <NeighborPropertyModal
              property={selectedNeighbor}
              referencePrice={price}
              onClose={() => setSelectedNeighborId(null)}
            />
          </div>
        )}
      </div>

      {/* Neighborhood Price Barometer & Comparative Stats */}
      <NeighborPriceBarometer
        currentPrice={price}
        neighbors={allNeighbors}
        commune={location.commune}
        wilaya={location.wilaya}
        showNeighborsOnMap={showNeighbors}
        onToggleShowNeighbors={() => setShowNeighbors(!showNeighbors)}
        onSelectNeighbor={(id) => setSelectedNeighborId(id)}
      />

      {/* Neighborhood Proximity Amenities */}
      <div className="space-y-3">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400 block">
          Commodités & Vie de quartier (Rayon immédiat)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {NEIGHBORHOOD_AMENITIES.map((amenity, idx) => {
            const Icon = amenity.icon;
            const isSelected = selectedAmenity === amenity.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAmenity(isSelected ? null : amenity.label)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E] shadow-sm'
                    : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border-stone-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`} />
                <div>
                  <span className="text-[11px] font-bold block leading-tight">{amenity.label}</span>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    ~ {amenity.distance}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Address Details & Fast Directions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400 block">
            Adresse exacte & Repère foncier
          </span>
          <span className="text-sm font-bold text-[#0D281E] block">
            {location.address || 'Secteur résidentiel calme et recherché'}, {location.commune}
          </span>
          <span className="text-xs text-stone-500 block">
            Accès aisé aux axes routiers, transports urbains et commodités de proximité.
          </span>
        </div>

        {/* Tactile Directions Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Waze</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
