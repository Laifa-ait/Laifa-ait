import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { BookingCategoryCard } from '../home/ArtisanCategoryBookingGrid';
import { getCommunesForWilaya } from '../../../data/artisanGeo';
import { createArtisanJobBroadcast } from '../../../services/artisan.api';
import { ArtisanJobBroadcast } from '../../../types/artisan';

export interface UseArtisanBroadcastProps {
  category: BookingCategoryCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (broadcast: ArtisanJobBroadcast) => void;
}

export function useArtisanBroadcastForm({
  category,
  isOpen,
  onClose,
  onSuccess,
}: UseArtisanBroadcastProps) {
  const { user } = useAuth();

  const [selectedPreset, setSelectedPreset] = React.useState<string>('');
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [urgency, setUrgency] = React.useState<'urgent' | 'standard' | 'flexible'>('standard');
  const [wilaya, setWilaya] = React.useState<string>('16 Alger');
  const [commune, setCommune] = React.useState<string>('');
  const [budget, setBudget] = React.useState<string>('');
  const [clientName, setClientName] = React.useState<string>('');
  const [clientPhone, setClientPhone] = React.useState<string>('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedBroadcast, setSubmittedBroadcast] = React.useState<ArtisanJobBroadcast | null>(null);

  React.useEffect(() => {
    if (user) {
      if (typeof user.displayName === 'string' && user.displayName) setClientName(user.displayName);
      const phoneVal = (user as { phone?: unknown; phoneNumber?: unknown }).phone || (user as { phone?: unknown; phoneNumber?: unknown }).phoneNumber;
      if (typeof phoneVal === 'string' && phoneVal) {
        setClientPhone(phoneVal);
      }
    }
  }, [user]);

  React.useEffect(() => {
    if (category) {
      setSelectedPreset('');
      setTitle('');
      setDescription('');
      setSubmittedBroadcast(null);
      setError(null);
    }
  }, [category]);

  const communes = getCommunesForWilaya(wilaya);

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setTitle(preset);
    if (!description) {
      setDescription(`Besoin d'un artisan qualifié en ${category?.name || 'travaux'} pour : ${preset}.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) return;
    if (!title.trim()) {
      setError('Veuillez préciser le titre ou choisir un besoin fréquent.');
      return;
    }
    if (!description.trim()) {
      setError('Veuillez décrire brièvement les travaux à réaliser.');
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    const cleanPhone = clientPhone.replace(/\s+/g, '');
    if (!/^(0[567][0-9]{8}|\+213[567][0-9]{8})$/.test(cleanPhone)) {
      setError('Numéro de téléphone algérien invalide. Ex: 0550123456');
      return;
    }

    setLoading(true);
    try {
      const res = await createArtisanJobBroadcast({
        tradeId: category.id,
        tradeName: category.name,
        categoryPreset: selectedPreset || undefined,
        title: title.trim(),
        description: description.trim(),
        wilaya,
        commune: commune.trim() || (communes[0] || 'Centre'),
        urgency,
        estimatedBudget: budget ? Number(budget) : undefined,
        clientName: clientName.trim(),
        clientPhone: cleanPhone,
        clientEmail: user?.email || undefined,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Erreur lors de la publication');
      }

      setSubmittedBroadcast(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  return {
    selectedPreset,
    title,
    setTitle,
    description,
    setDescription,
    urgency,
    setUrgency,
    wilaya,
    setWilaya,
    commune,
    setCommune,
    budget,
    setBudget,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    loading,
    error,
    submittedBroadcast,
    communes,
    handleSelectPreset,
    handleSubmit,
  };
}
