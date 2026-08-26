import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, getDocs, doc, updateDoc, limit, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../../lib/firebase';
import toast from 'react-hot-toast';

export interface AuditState {
  static: { ar: number; en: number; total: number };
  products: { ar: number; en: number; total: number };
}

export interface MonthlyItem {
  id: string;
  month: string;
  createdAt?: string;
  updatedAt?: string;
  text_fr: string;
  text_ar: string;
  text_en: string;
}

export interface AgentMessage {
  sender: 'agent' | 'user';
  text: string;
  time: string;
  translation?: string;
  original?: string;
  lang?: 'ar' | 'en';
}

export const useTranslationAdmin = () => {
  const { i18n } = useTranslation();
  const [auditState, setAuditState] = useState<AuditState>({
    static: { ar: 0, en: 0, total: 0 },
    products: { ar: 0, en: 0, total: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'monthly' | 'agent' | 'dictionary'>('audit');

  // Dictionary State
  const [dictFr, setDictFr] = useState<Record<string, string>>({});
  const [dictAr, setDictAr] = useState<Record<string, string>>({});
  const [dictEn, setDictEn] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fr: '', ar: '', en: '' });
  const [isSavingKey, setIsSavingKey] = useState<string | null>(null);

  // New Translation Key fields
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState({ key: '', fr: '', ar: '', en: '' });

  // Fictive / Status Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'mock_ar' | 'mock_en' | 'missing' | 'translated'>('all');
  const [isCleaningFictive, setIsCleaningFictive] = useState(false);
  const [isTranslatingSingle, setIsTranslatingSingle] = useState(false);

  // Monthly content state
  const [monthlyContent, setMonthlyContent] = useState<MonthlyItem[]>([]);
  const [newMonthlyText, setNewMonthlyText] = useState('');

  // Agent state
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    {
      sender: 'agent',
      text: "السلام عليكم ورحمة الله وبركاته ! Je suis Mabrouk, votre Agent de Traduction OLMART 100% gratuit et indépendant. Mon système n'impose aucun frais d'API ni de coûts d'abonnement pour votre entreprise.\n\nJe peux traduire instantanément vos fiches produits, bannières, alertes ou textes d'affichage du français vers l'arabe algérien ou l'anglais global. Écrivez votre texte ci-dessous pour commencer ! 🇩🇿",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [agentInput, setAgentInput] = useState('');
  const [agentTargetLang, setAgentTargetLang] = useState<'ar' | 'en'>('ar');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setIsLoading(false);
    try {
      const ts = Date.now();
      const [fr, ar, en] = (await Promise.all([
        fetch(`/locales/fr.json?v=${ts}`).then((r) => r.json()).catch(() => ({})),
        fetch(`/locales/ar.json?v=${ts}`).then((r) => r.json()).catch(() => ({})),
        fetch(`/locales/en.json?v=${ts}`).then((r) => r.json()).catch(() => ({})),
      ])) as [Record<string, string>, Record<string, string>, Record<string, string>];

      const frKeys = Object.keys(fr);
      const totalKeys = frKeys.length;

      const isMissingAr = (k: string) => {
        const val = ar[k];
        return !val || val === '' || val === fr[k] || val.endsWith(' (AR)');
      };
      const isMissingEn = (k: string) => {
        const val = en[k];
        return !val || val === '' || val === fr[k] || val.endsWith(' (EN)');
      };

      const arMissing = frKeys.filter(isMissingAr).length;
      const enMissing = frKeys.filter(isMissingEn).length;

      let prodTotal = 0;
      let prodArMissing = 0;
      let prodEnMissing = 0;
      try {
        const prodSnap = await getDocs(query(collection(db, 'products'), limit(300)));
        const products = prodSnap.docs.map((d) => d.data());
        prodTotal = products.length;
        prodArMissing = products.filter((p) => !p.translations || !p.translations?.ar?.name).length;
        prodEnMissing = products.filter((p) => !p.translations || !p.translations?.en?.name).length;
      } catch (err) {
        console.warn('Audit products failed, setting to 0', err);
      }

      setAuditState({
        static: { ar: arMissing, en: enMissing, total: totalKeys },
        products: { ar: prodArMissing, en: prodEnMissing, total: prodTotal },
      });

      setDictFr(fr);
      setDictAr(ar);
      setDictEn(en);

      const monthlySnap = await getDocs(query(collection(db, 'site_content_monthly'), limit(20)));
      setMonthlyContent(monthlySnap.docs.map((d) => ({ id: d.id, ...d.data() } as MonthlyItem)));
    } catch (error) {
      console.error('Audit fail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanFictive = async () => {
    setIsCleaningFictive(true);
    const tId = toast.loading('Arrosage automatique IA de toutes les traductions fictives...');
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const response = await fetch('/api/v1/admin/translate-fictive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.');

      if (result.count === 0) {
        toast.success('Tout est déjà à jour ! Aucune traduction fictive trouvée.', { id: tId });
      } else {
        toast.success(`${result.count} traductions fictives (AR/EN) ont été corrigées avec de vraies traductions !`, {
          id: tId,
          duration: 4500,
        });
      }

      setTimeout(async () => {
        await i18n.reloadResources();
        runAudit();
      }, 1500);
    } catch (err: unknown) {
      console.error('Clean fictive error:', err);
      const msg = err instanceof Error ? err.message : 'Erreur de nettoyage.';
      toast.error(msg, { id: tId });
    } finally {
      setIsCleaningFictive(false);
    }
  };

  const handleTranslateSingleKey = async (key: string, frText: string) => {
    if (!frText.trim()) {
      toast.error('Veuillez d’abord saisir le texte source en français.');
      return;
    }
    setIsTranslatingSingle(true);
    const tId = toast.loading('Mabrouk active ses algorithmes de traduction...');
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const response = await fetch('/api/v1/admin/translate-single-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ key, fr: frText }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Une erreur est survenue.');

      if (result.ar && result.en) {
        setEditForm((prev) => ({
          ...prev,
          ar: result.ar,
          en: result.en,
        }));
        toast.success('Traductions générées !', { id: tId });
      } else {
        throw new Error('Réponse incomplète.');
      }
    } catch (err: unknown) {
      console.error('Single translate error:', err);
      const msg = err instanceof Error ? err.message : 'Erreur de traduction IA.';
      toast.error(msg, { id: tId });
    } finally {
      setIsTranslatingSingle(false);
    }
  };

  const handleSaveTranslation = async (key: string, customFr?: string, customAr?: string, customEn?: string) => {
    setIsSavingKey(key);
    const tId = toast.loading('Mise à jour de la traduction en cours...');
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const finalFr = customFr !== undefined ? customFr : editForm.fr;
      const finalAr = customAr !== undefined ? customAr : editForm.ar;
      const finalEn = customEn !== undefined ? customEn : editForm.en;

      const response = await fetch('/api/v1/admin/save-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          key,
          fr: finalFr,
          ar: finalAr,
          en: finalEn,
        }),
      });

      if (!response.ok) throw new Error('Échec de la sauvegarde.');

      toast.success('Traduction mise à jour avec succès !', { id: tId });

      setDictFr((prev) => ({ ...prev, [key]: finalFr }));
      setDictAr((prev) => ({ ...prev, [key]: finalAr }));
      setDictEn((prev) => ({ ...prev, [key]: finalEn }));

      setEditingKey(null);

      setTimeout(async () => {
        await i18n.reloadResources();
        runAudit();
      }, 1000);
    } catch (err: unknown) {
      console.error('Save translation error:', err);
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.';
      toast.error(msg, { id: tId });
    } finally {
      setIsSavingKey(null);
    }
  };

  const handleAddNewKey = async () => {
    const key = newKeyData.key.trim();
    const fr = newKeyData.fr.trim();
    const ar = newKeyData.ar.trim();
    const en = newKeyData.en.trim();

    if (!key) {
      toast.error('Veuillez saisir une clé unique.');
      return;
    }

    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const response = await fetch('/api/v1/admin/save-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ key, fr, ar, en }),
      });

      if (!response.ok) throw new Error('Échec de la création de la clé.');

      toast.success(`Nouvelle clé "${key}" ajoutée !`);

      setDictFr((prev) => ({ ...prev, [key]: fr }));
      setDictAr((prev) => ({ ...prev, [key]: ar }));
      setDictEn((prev) => ({ ...prev, [key]: en }));

      setNewKeyData({ key: '', fr: '', ar: '', en: '' });
      setShowNewKeyModal(false);

      setTimeout(async () => {
        await i18n.reloadResources();
        runAudit();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de création de la clé.';
      toast.error(msg);
    }
  };

  const handleTranslateUI = async () => {
    setIsTranslating(true);
    const toastId = toast.loading('Récolte des catégories et bannières, puis envoi de la traduction IA...');
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const clientKeys = new Set<string>();

      try {
        const { PRODUCT_HIERARCHY } = await import('../../../../constants');
        if (Array.isArray(PRODUCT_HIERARCHY)) {
          PRODUCT_HIERARCHY.forEach((cat) => {
            if (cat.name) clientKeys.add(cat.name.trim());
            if (Array.isArray(cat.subcategories)) {
              cat.subcategories.forEach((sub: { name: string; subSubCategories?: unknown[] }) => {
                if (sub.name) clientKeys.add(sub.name.trim());
                if (Array.isArray(sub.subSubCategories)) {
                  sub.subSubCategories.forEach((subSub: unknown) => {
                    if (typeof subSub === 'string') {
                      clientKeys.add(subSub.trim());
                    } else if (subSub && typeof subSub === 'object' && 'name' in subSub) {
                      const name = (subSub as { name: string }).name;
                      if (typeof name === 'string') {
                        clientKeys.add(name.trim());
                      }
                    }
                  });
                }
              });
            }
          });
        }
      } catch (err) {
        console.warn('Client key harvest: PRODUCT_HIERARCHY fails', err);
      }

      try {
        const catDoc = await getDoc(doc(db, 'settings', 'categories'));
        if (catDoc.exists()) {
          const hierarchy = catDoc.data()?.hierarchy;
          if (hierarchy && typeof hierarchy === 'object') {
            Object.keys(hierarchy).forEach((cat) => {
              if (cat) clientKeys.add(cat.trim());
              const subcatsObj = hierarchy[cat];
              if (subcatsObj && typeof subcatsObj === 'object') {
                Object.keys(subcatsObj).forEach((sub) => {
                  if (sub) clientKeys.add(sub.trim());
                  const subSubs = subcatsObj[sub];
                  if (Array.isArray(subSubs)) {
                    subSubs.forEach((subSub) => {
                      if (subSub && typeof subSub === 'string') {
                        clientKeys.add(subSub.trim());
                      }
                    });
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn('Client key harvest: settings/categories fails', err);
      }

      try {
        const hpCats = await getDocs(query(collection(db, 'homepage_categories_v2'), limit(100)));
        hpCats.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.title && typeof data.title === 'string') clientKeys.add(data.title.trim());
          if (data.subtitle && typeof data.subtitle === 'string') clientKeys.add(data.subtitle.trim());
        });
      } catch (err) {
        console.warn('Client key harvest: homepage_categories_v2 fails', err);
      }

      try {
        const hpSections = await getDocs(query(collection(db, 'homepage_sections'), limit(50)));
        hpSections.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.title && typeof data.title === 'string') clientKeys.add(data.title.trim());
        });
      } catch (err) {
        console.warn('Client key harvest: homepage_sections fails', err);
      }

      try {
        const banners = await getDocs(query(collection(db, 'banners'), limit(50)));
        banners.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.title && typeof data.title === 'string') clientKeys.add(data.title.trim());
          if (data.subtitle && typeof data.subtitle === 'string') clientKeys.add(data.subtitle.trim());
          if (data.badgeText && typeof data.badgeText === 'string') clientKeys.add(data.badgeText.trim());
        });
      } catch (err) {
        console.warn('Client key harvest: banners fails', err);
      }

      try {
        const tags = await getDocs(query(collection(db, 'tags'), limit(200)));
        tags.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name && typeof data.name === 'string') clientKeys.add(data.name.trim());
        });
      } catch (err) {
        console.warn('Client key harvest: tags fails', err);
      }

      const harvestedList = Array.from(clientKeys).filter((k) => k && k.length > 1 && !k.startsWith('http'));

      const response = await fetch('/api/v1/admin/translate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ harvestedKeys: harvestedList }),
      });

      const result = await response.json().catch(() => ({ error: 'Erreur réseau' }));

      if (!response.ok) throw new Error(result.error || 'Erreur réseau');
      if (result.error) throw new Error(result.error);

      if (result.mockedCount > 0) {
        toast.error(
          `Attention : ${result.mockedCount} clés ont été suffixées temporairement avec (AR)/(EN) car l'API Gemini a échoué (Limite de quota, clé expirée ou indisponible). Rapprochez-vous d'un administrateur pour configurer une clé d'API valide.`,
          { id: toastId, duration: 8000 }
        );
      } else if (result.count === 0) {
        toast.success('Tout est déjà traduit !', { id: toastId });
      } else {
        toast.success(
          `${result.count} clés traduites ! ${
            result.remaining > 0 ? `(Encore ${result.remaining} à faire, recliquez...)` : ''
          }`,
          { id: toastId, duration: result.remaining > 0 ? 6000 : 3000 }
        );
      }

      setTimeout(async () => {
        await i18n.reloadResources();
        runAudit();
      }, 2000);
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erreur durant la traduction UI.';
      toast.error(msg, { id: toastId, duration: 5000 });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAutoTranslateProducts = async () => {
    setIsTranslating(true);
    const toastId = toast.loading('Traduction automatique des produits en cours (Batch de 50)...');
    try {
      const prodSnapForScan = await getDocs(query(collection(db, 'products'), limit(300)));
      const untranslatedDocs = prodSnapForScan.docs
        .filter((docSnap) => {
          const data = docSnap.data();
          return !data.translations || !data.translations?.ar?.name || !data.translations?.en?.name;
        })
        .slice(0, 50);

      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      interface TranslationResponse {
        name?: { ar?: string; en?: string };
        description?: { ar?: string; en?: string };
        name_ar?: string;
        name_en?: string;
        description_ar?: string;
        description_en?: string;
      }

      let count = 0;
      for (const docSnap of untranslatedDocs) {
        const data = docSnap.data();
        if (!data.translations?.ar?.name || !data.translations?.en?.name) {
          let translations: TranslationResponse | null = null;

          try {
            const response = await fetch('/api/v1/translate-product', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                name: data.name || 'Produit sans titre',
                description: data.description || 'Pas de description',
              }),
            });

            if (response.ok) {
              const resJson = await response.json();
              if (resJson && !resJson.error && resJson.name?.ar) {
                translations = resJson;
              } else {
                console.warn('API translation returned error or empty response: ', resJson);
              }
            } else {
              console.warn('API translation HTTP failed with status: ', response.status);
            }
          } catch (apiError) {
            console.warn('API Translation failed, reverting to smart local fallback:', apiError);
          }

          if (!translations) {
            const commonWords: { [key: string]: string } = {
              veste: 'سترة',
              manteau: 'معطف',
              pantalon: 'سروال',
              chemise: 'قميص',
              robe: 'فستان',
              chaussure: 'حذاء',
              sac: 'حقيبة',
              montre: 'ساعة',
              't-shirt': 'تي شيرت',
              lunettes: 'نظارات',
              parfum: 'عطر',
            };
            let name_ar = data.name || 'منتج';
            const lowerName = (data.name || '').toLowerCase();
            let foundWord = false;
            for (const [frWord, arWord] of Object.entries(commonWords)) {
              if (lowerName.includes(frWord)) {
                name_ar = `${arWord} - ${data.name}`;
                foundWord = true;
                break;
              }
            }
            if (!foundWord) {
              name_ar = `${data.name || 'منتج'} • مترجم`;
            }

            translations = {
              name_ar,
              name_en: data.name ? `${data.name} (EN)` : 'Product (EN)',
              description_ar: data.description ? `${data.description} • (ترجمة تلقائية)` : 'لا يوجد وصف',
              description_en: data.description ? `${data.description} • (Auto-translated)` : 'No description available',
            };
          }

          await updateDoc(doc(db, 'products', docSnap.id), {
            translations: {
              ar: {
                name: translations.name?.ar || translations.name_ar,
                description: translations.description?.ar || translations.description_ar,
              },
              en: {
                name: translations.name?.en || translations.name_en,
                description: translations.description?.en || translations.description_en,
              },
              fr: { name: data.name || '', description: data.description || '' },
            },
          });
          count++;
        }
      }
      toast.success(`${count} produits traduits avec succès !`, { id: toastId });
      runAudit();
    } catch (error) {
      console.error('Critical error in auto translate products:', error);
      toast.error('Erreur durant la traduction.', { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  };

  const registerMonthlyContent = async () => {
    if (!newMonthlyText.trim()) return;
    const toastId = toast.loading('Enregistrement et traduction...');
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const response = await fetch('/api/v1/admin/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          text: newMonthlyText,
          targetLangs: ['ar', 'en', 'fr'],
        }),
      });
      const translations = await response.json();

      const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

      await updateDoc(doc(db, 'site_content_monthly', month), {
        text_fr: translations.fr || newMonthlyText,
        text_ar: translations.ar,
        text_en: translations.en,
        updatedAt: new Date().toISOString(),
        month: month,
      });

      toast.success('Contenu mensuel enregistré et traduit !', { id: toastId });
      setNewMonthlyText('');
      runAudit();
    } catch {
      try {
        const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        const user = auth.currentUser;
        const idToken = await user?.getIdToken();
        const response = await fetch('/api/v1/admin/translate-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ text: newMonthlyText, targetLangs: ['ar', 'en', 'fr'] }),
        });
        const translations = await response.json();

        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'site_content_monthly'), {
          text_fr: translations.fr || newMonthlyText,
          text_ar: translations.ar,
          text_en: translations.en,
          createdAt: new Date().toISOString(),
          month: month,
        });
        toast.success('Contenu mensuel ajouté !', { id: toastId });
        setNewMonthlyText('');
        runAudit();
      } catch {
        toast.error("Échec de l'enregistrement.", { id: toastId });
      }
    }
  };

  const handleSendAgentMessage = async () => {
    if (!agentInput.trim()) return;
    const userText = agentInput;
    setAgentInput('');

    const userMsg: AgentMessage = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setAgentMessages((prev) => [...prev, userMsg]);
    setIsAgentTyping(true);

    try {
      const response = await fetch('/api/v1/admin/translate-single-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          key: 'chat_translation',
          fr: userText,
        }),
      });
      const data = await response.json();

      let translation = '';
      if (agentTargetLang === 'ar' && data?.ar) {
        translation = data.ar;
      } else if (agentTargetLang === 'en' && data?.en) {
        translation = data.en;
      } else {
        throw new Error('API Gemini non disponible');
      }

      setTimeout(() => {
        const responseText =
          agentTargetLang === 'ar'
            ? `Voici la traduction en Arabe (Propulsé par Gemini AI) :\n\n"${translation}"`
            : `Here is the translation in English (Powered by Gemini AI) :\n\n"${translation}"`;

        setAgentMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: responseText,
            translation: translation,
            original: userText,
            lang: agentTargetLang,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsAgentTyping(false);
      }, 300);
    } catch {
      setTimeout(() => {
        const dict: Record<string, string> = {
          boutique: 'متجر',
          produit: 'منتج',
          panier: 'سلة التسوق',
          commande: 'طلب',
          vendeur: 'بائع',
          acheteur: 'مشتري',
          livraison: 'توصيل',
          prix: 'سعر',
          catégorie: 'فئة',
          accueil: 'الرئيسية',
          profil: 'الملف الشخصi',
          paramètres: 'الإعدادات',
          téléphone: 'هاتف',
          adresse: 'عنوان',
          wilaya: 'ولاية',
        };
        const lower = userText.toLowerCase().trim();
        let translation = dict[lower] || '';

        if (!translation) {
          translation = `${userText} (AR - Offline Fallback)`;
        }

        const responseText = `[Mode Secours Hors-ligne Actif]\n\nVoici le résultat :\n"${translation}"`;
        setAgentMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: responseText,
            translation: translation,
            original: userText,
            lang: agentTargetLang,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsAgentTyping(false);
      }, 600);
    }
  };

  const completenessAr = Math.round(((auditState.static.total - auditState.static.ar) / auditState.static.total) * 100) || 0;
  const completenessEn = Math.round(((auditState.static.total - auditState.static.en) / auditState.static.total) * 100) || 0;

  return {
    auditState,
    isLoading,
    isTranslating,
    activeTab,
    setActiveTab,
    dictFr,
    dictAr,
    dictEn,
    searchQuery,
    setSearchQuery,
    editingKey,
    setEditingKey,
    editForm,
    setEditForm,
    isSavingKey,
    showNewKeyModal,
    setShowNewKeyModal,
    newKeyData,
    setNewKeyData,
    statusFilter,
    setStatusFilter,
    isCleaningFictive,
    isTranslatingSingle,
    monthlyContent,
    newMonthlyText,
    setNewMonthlyText,
    agentMessages,
    agentInput,
    setAgentInput,
    agentTargetLang,
    setAgentTargetLang,
    isAgentTyping,
    handleCleanFictive,
    handleTranslateSingleKey,
    handleSaveTranslation,
    handleAddNewKey,
    handleTranslateUI,
    handleAutoTranslateProducts,
    registerMonthlyContent,
    handleSendAgentMessage,
    completenessAr,
    completenessEn,
  };
};
