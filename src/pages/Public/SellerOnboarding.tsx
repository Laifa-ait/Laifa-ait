import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Store, FileText, CreditCard, Box, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { apiPost } from '../../lib/api';

export const SellerOnboarding: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    documentId: '',
    rib: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await apiPost('/api/v1/auth/seller-onboard', {
        storeName: formData.storeName,
        storeDescription: formData.description,
        documentId: formData.documentId,
        rib: formData.rib
      });
      toast.success(t("Bienvenue sur votre espace vendeur !"));
      navigate('/dashboard/seller');
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(errorMsg || t("Erreur lors de la finalisation."));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Boutique', icon: <Store className="w-6 h-6" /> },
    { id: 2, title: 'Vérification', icon: <FileText className="w-6 h-6" /> },
    { id: 3, title: 'Paiement', icon: <CreditCard className="w-6 h-6" /> },
    { id: 4, title: 'Catalogue', icon: <Box className="w-6 h-6" /> },
    { id: 5, title: 'Prêt', icon: <CheckCircle className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{t("Devenir vendeur sur Olmart")}</h1>
            <p className="text-slate-600">Complétez ces quelques étapes pour ouvrir votre boutique</p>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
              
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-50 transition-colors ${step >= s.id ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {s.icon}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${step >= s.id ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">1. Informations de la boutique</h2>
                <div>
                  <label htmlFor="storeName" className="block text-sm font-semibold text-slate-700 mb-2">Nom de la boutique</label>
                  <input id="storeName" type="text" aria-label="Nom de la boutique" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Ex: Boutique Tech Alger" />
                </div>
                <div>
                  <label htmlFor="storeDesc" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea id="storeDesc" aria-label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-transparent border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Décrivez votre boutique..." />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">2. Vérification d'identité (KYC)</h2>
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-blue-800 mb-4">Pour protéger nos clients, nous avons besoin de vérifier votre identité.</p>
                  <label htmlFor="kycDoc" className="block text-sm font-semibold text-slate-700 mb-2">Numéro de Registre de Commerce ou NIF</label>
                  <input id="kycDoc" type="text" aria-label="NIF" value={formData.documentId} onChange={e => setFormData({...formData, documentId: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Ex: 1234567890" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">3. Configuration de paiement</h2>
                <p className="text-slate-600">Comment souhaitez-vous recevoir vos paiements ?</p>
                <div>
                  <label htmlFor="rib" className="block text-sm font-semibold text-slate-700 mb-2">RIB / CCP (20 chiffres)</label>
                  <input id="rib" type="text" aria-label="RIB / CCP" value={formData.rib} onChange={e => setFormData({...formData, rib: e.target.value})} className="w-full px-4 py-3 bg-transparent border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Ex: 00000000000000000000" />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">4. Préparez votre catalogue</h2>
                <div className="bg-transparent p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                  <Box className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-slate-600">Vous pourrez ajouter vos produits dès que vous accéderez à votre tableau de bord.</p>
                  <ul className="text-sm text-slate-500 text-left list-disc list-inside space-y-2 max-w-sm mx-auto">
                    <li>Préparez des photos claires et lumineuses</li>
                    <li>Rédigez des descriptions détaillées</li>
                    <li>Fixez des prix compétitifs</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-900">Vous y êtes presque !</h2>
                <p className="text-slate-600 max-w-md mx-auto">Votre boutique est prête à être créée. Une fois sur votre tableau de bord, vous pourrez commencer à ajouter vos produits et configurer vos options de livraison.</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
              <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || loading}
                className="px-6 py-3 font-semibold text-slate-600 hover:bg-transparent rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>

              {step < 5 ? (
                <button 
                  onClick={() => setStep(Math.min(5, step + 1))}
                  className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
                >
                  Suivant <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {loading ? 'Création...' : 'Ouvrir ma boutique'} <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};
