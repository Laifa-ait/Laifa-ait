import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Info, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { Button } from "../../components/ui/Button";

export const SettingsAdmin: React.FC = () => {
    const { t } = useTranslation();
  const [aboutText, setAboutText] = useState("");
  const [registrationRules, setRegistrationRules] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.aboutText) setAboutText(data.aboutText);
          if (data.registrationRules) setRegistrationRules(data.registrationRules);
          if (data.privacyPolicy) setPrivacyPolicy(data.privacyPolicy);
          if (data.refundPolicy) setRefundPolicy(data.refundPolicy);
          if (data.supportEmail) setSupportEmail(data.supportEmail);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!aboutText.trim()) {
      toast.error("Le texte À propos ne peut pas être vide.");
      return;
    }
    
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      await setDoc(docRef, { 
        aboutText, 
        registrationRules,
        privacyPolicy,
        refundPolicy,
        supportEmail
      }, { merge: true });
      toast.success("Paramètres enregistrés avec succès.");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Toaster position="bottom-right" />
      <AdminPageHeader 
        title={t("Paramètres Généraux")}
        subtitle={t("Gérez les textes et paramètres globaux de la plateforme.")}
        actions={
          <Button
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
            icon={Save}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        }
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-zinc-100 rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("À propos d'Olma")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Ce texte s'affichera dans le menu mobile pour les utilisateurs.")}</p>
              </div>
            </div>
            
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder={t("Texte 'À propos d'Olma'...") || "Texte 'À propos d'Olma'..."}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-orange-500 font-medium text-sm min-h-[200px]"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("Email de Support & Contact")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Moyen de contact par défaut affiché dans le footer.")}</p>
              </div>
            </div>
            
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="Ex: contact@olma.dz"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-orange-500 font-medium text-sm"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("Politique de Confidentialité")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Texte de la politique de confidentialité de la plateforme.")}</p>
              </div>
            </div>
            
            <textarea
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              placeholder={t("Texte de la politique de confidentialité...") || "Texte de la politique de confidentialité..."}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-green-500 font-medium text-sm min-h-[200px]"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("Politique de Remboursement et Retour")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Texte de la politique de remboursement et retour de la plateforme.")}</p>
              </div>
            </div>
            
            <textarea
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              placeholder={t("Texte de la politique de remboursement...") || "Texte de la politique de remboursement..."}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-red-500 font-medium text-sm min-h-[200px]"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("Règles d'inscription & CGV")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Oblige les utilisateurs à lire et accepter ces règles avant l'inscription.")}</p>
              </div>
            </div>
            
            <textarea
              value={registrationRules}
              onChange={(e) => setRegistrationRules(e.target.value)}
              placeholder={t("Texte des conditions d'utilisation et règles d'inscription...") || "Texte des conditions d'utilisation et règles d'inscription..."}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-500 font-medium text-sm min-h-[200px]"
            />
          </div>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-lg text-zinc-950">{t("Modèle Logistique Marketplace")}</h2>
                <p className="text-xs font-bold text-zinc-500">{t("Information sur le mode de livraison sous la responsabilité des vendeurs.")}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <p className="text-sm font-bold text-emerald-950 mb-1">{t("Mode de livraison actif : Direct Vendeur")}</p>
                <p className="text-xs font-medium text-emerald-700">Chaque vendeur gère l'expédition de ses commandes, génère ses bordereaux Olmart et renseigne éventuellement le suivi d'un transporteur externe.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
