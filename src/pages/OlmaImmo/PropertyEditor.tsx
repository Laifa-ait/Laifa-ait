import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  Property,
  PropertyType,
  ListingType,
  LegalPaperType,
  GeoPointLocation,
  PropertyStatus,
  UtilityCharges,
} from '../../types/realEstate';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { ArrowLeft, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { EditorStepper, StepItem } from '../../components/OlmaImmo/PropertyEditor/EditorStepper';
import { EditorStepTransaction } from '../../components/OlmaImmo/PropertyEditor/EditorStepTransaction';
import { EditorStepLocation } from '../../components/OlmaImmo/PropertyEditor/EditorStepLocation';
import { EditorStepMedia } from '../../components/OlmaImmo/PropertyEditor/EditorStepMedia';
import { EditorStepSpecs } from '../../components/OlmaImmo/PropertyEditor/EditorStepSpecs';
import { EditorStepPricing } from '../../components/OlmaImmo/PropertyEditor/EditorStepPricing';
import { EditorStepPreview } from '../../components/OlmaImmo/PropertyEditor/EditorStepPreview';

const STEPS: StepItem[] = [
  { id: 1, title: 'Transaction', short: '01' },
  { id: 2, title: 'Localisation', short: '02' },
  { id: 3, title: 'Photos', short: '03' },
  { id: 4, title: 'Caractéristiques', short: '04' },
  { id: 5, title: 'Prix & Texte', short: '05' },
  { id: 6, title: 'Aperçu & Validation', short: '06' },
];

export const PropertyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [legalPapers, setLegalPapers] = useState<LegalPaperType[]>([
    'acte_notarie_individuel',
    'livret_foncier',
  ]);
  const [legalPaperType, setLegalPaperType] = useState<LegalPaperType>('acte_notarie_individuel');
  const [location, setLocation] = useState<GeoPointLocation>({
    wilaya: 'Alger',
    commune: 'Bab Ezzouar',
    address: 'Cité résidentielle',
    lat: 36.721,
    lng: 3.183,
  });
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
  ]);

  const [areaSquareMeters, setAreaSquareMeters] = useState<number>(120);
  const [rooms, setRooms] = useState<number>(4);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [cleaningFee, setCleaningFee] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [features, setFeatures] = useState<string[]>(['Climatisation', 'Ascenseur']);

  const [price, setPrice] = useState<number>(18500000);
  const [pricePeriod, setPricePeriod] = useState<'night' | 'month' | 'total'>('total');
  const [paymentAdvanceMonths, setPaymentAdvanceMonths] = useState<1 | 3 | 6 | 12>(6);
  const [securityDepositMonths, setSecurityDepositMonths] = useState<number>(1);
  const [isPriceNegotiable, setIsPriceNegotiable] = useState<boolean>(false);
  const [utilityCharges, setUtilityCharges] = useState<UtilityCharges>({
    water: false,
    electricityGas: false,
    condoFees: false,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('0550123456');
  const [status, setStatus] = useState<PropertyStatus>('active');

  const { currentUser, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      apiGet<{ success: boolean; data?: Property }>(`/api/v1/real-estate/properties/${id}`)
        .then((res) => {
          if (res.success && res.data) {
            const p = res.data;
            setTitle(p.title);
            setDescription(p.description || '');
            setPropertyType(p.propertyType);
            setListingType(p.listingType);
            const loadedPapers: LegalPaperType[] = Array.isArray(p.legalPapers) && p.legalPapers.length > 0
              ? p.legalPapers
              : (p.legalPaperType ? [p.legalPaperType] : ['acte_notarie_individuel']);
            setLegalPapers(loadedPapers);
            setLegalPaperType(loadedPapers[0] || 'acte_notarie_individuel');
            setPrice(p.price);
            setPricePeriod(p.pricePeriod || 'total');
            setPaymentAdvanceMonths(p.paymentAdvanceMonths || 6);
            setSecurityDepositMonths(p.securityDepositMonths ?? 1);
            setIsPriceNegotiable(Boolean(p.isPriceNegotiable));
            setUtilityCharges(p.utilityCharges || { water: false, electricityGas: false, condoFees: false });
            setAreaSquareMeters(p.areaSquareMeters);
            setRooms(p.rooms);
            setBathrooms(p.bathrooms || 1);
            setFeatures(p.features || []);
            setImages(p.images && p.images.length > 0 ? p.images : []);
            setLocation(p.location);
            setContactPhone(p.contactPhone || '');
            setStatus(p.status);
            setCleaningFee(p.cleaningFee || 0);
            setServiceFee(p.serviceFee || 0);
          }
        })
        .catch(() => toast.error("Erreur de chargement de l'annonce"))
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, id]);

  const handleSubmit = async () => {
    if (!currentUser && !authLoading) {
      toast.error('Veuillez vous connecter pour publier une annonce');
      navigate('/auth?redirect=/immo/publish');
      return;
    }

    if (!title.trim()) {
      toast.error("Veuillez saisir un titre pour l'annonce");
      setCurrentStep(5);
      return;
    }
    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    const cleanTitle = title.trim();
    const cleanDescription = description.trim() || cleanTitle;

    const payload = {
      title: cleanTitle,
      description: cleanDescription,
      propertyType,
      listingType,
      legalPapers,
      legalPaperType: legalPapers[0] || legalPaperType,
      price: Number(price),
      pricePeriod: pricePeriod || 'total',
      paymentAdvanceMonths: listingType === 'rent_long' ? paymentAdvanceMonths : undefined,
      securityDepositMonths: listingType === 'rent_long' || listingType === 'rent_short' ? securityDepositMonths : undefined,
      isPriceNegotiable,
      utilityCharges,
      areaSquareMeters: Number(areaSquareMeters),
      rooms: Number(rooms),
      bathrooms: Number(bathrooms),
      features,
      images,
      location,
      contactPhone: contactPhone || '',
      cleaningFee: listingType === 'rent_short' ? Number(cleaningFee) : undefined,
      serviceFee: listingType === 'rent_short' ? Number(serviceFee) : undefined,
      status: isEditMode ? status : 'active',
    };

    try {
      if (isEditMode && id) {
        const res = await apiPut<{ success: boolean; error?: string }>(`/api/v1/real-estate/properties/${id}`, payload);
        if (res.success) {
          toast.success('Annonce mise à jour avec succès');
          navigate('/immo/owner');
        } else {
          toast.error(res.error || 'Erreur lors de la mise à jour');
        }
      } else {
        const res = await apiPost<{ success: boolean; data?: Property; error?: string }>('/api/v1/real-estate/properties', payload);
        if (res.success) {
          toast.success('Votre annonce a été publiée avec succès !');
          navigate('/immo/owner');
        } else {
          toast.error(res.error || 'Erreur lors de la publication');
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement de l'annonce";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col">
        <OlmaImmoNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse text-xs font-bold text-slate-500">
          Chargement de l'annonce...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans pb-24 md:pb-12">
      <OlmaImmoNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/immo/owner"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1a3831] bg-white border border-[#e8e2d4] px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 text-[#1a3831]" />
            <span>Tableau de bord</span>
          </Link>
          <span className="text-xs font-bold text-slate-500">
            Étape {currentStep} sur {STEPS.length}
          </span>
        </div>

        {/* Stepper */}
        <EditorStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

        {/* Step Views */}
        {currentStep === 1 && (
          <EditorStepTransaction
            listingType={listingType}
            setListingType={setListingType}
            propertyType={propertyType}
            setPropertyType={setPropertyType}
            legalPaperType={legalPaperType}
            setLegalPaperType={setLegalPaperType}
            legalPapers={legalPapers}
            setLegalPapers={setLegalPapers}
          />
        )}

        {currentStep === 2 && (
          <EditorStepLocation location={location} setLocation={setLocation} />
        )}

        {currentStep === 3 && (
          <EditorStepMedia images={images} setImages={setImages} />
        )}

        {currentStep === 4 && (
          <EditorStepSpecs
            areaSquareMeters={areaSquareMeters}
            setAreaSquareMeters={setAreaSquareMeters}
            rooms={rooms}
            setRooms={setRooms}
            bathrooms={bathrooms}
            setBathrooms={setBathrooms}
            features={features}
            setFeatures={setFeatures}
          />
        )}

        {currentStep === 5 && (
          <EditorStepPricing
            listingType={listingType}
            price={price}
            setPrice={setPrice}
            pricePeriod={pricePeriod}
            setPricePeriod={setPricePeriod}
            paymentAdvanceMonths={paymentAdvanceMonths}
            setPaymentAdvanceMonths={setPaymentAdvanceMonths}
            securityDepositMonths={securityDepositMonths}
            setSecurityDepositMonths={setSecurityDepositMonths}
            isPriceNegotiable={isPriceNegotiable}
            setIsPriceNegotiable={setIsPriceNegotiable}
            utilityCharges={utilityCharges}
            setUtilityCharges={setUtilityCharges}
            cleaningFee={cleaningFee}
            setCleaningFee={setCleaningFee}
            serviceFee={serviceFee}
            setServiceFee={setServiceFee}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
          />
        )}

        {currentStep === 6 && (
          <EditorStepPreview
            title={title}
            description={description}
            listingType={listingType}
            propertyType={propertyType}
            legalPaperType={legalPaperType}
            location={location}
            price={price}
            pricePeriod={pricePeriod}
            rooms={rooms}
            areaSquareMeters={areaSquareMeters}
            bathrooms={bathrooms}
            images={images}
            features={features}
            contactPhone={contactPhone}
          />
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e8e2d4]">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-5 py-3 rounded-xl border border-[#e8e2d4] bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
              className="px-6 py-3 rounded-xl bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-2xl bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 text-[#ebdcb8]" />
              <span>{isSubmitting ? 'Publication en cours...' : isEditMode ? 'Enregistrer les modifications' : "Publier l'annonce"}</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
