import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Image as ImageIcon, Upload, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiPut } from '../../lib/api';
import { ALGERIA_WILAYAS } from '../../constants';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { maskSensitiveData, hasExternalChannel } from '../../utils/masking';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { TwoFactorSecurityModal } from '../../components/Security/TwoFactorSecurityModal';

interface ShopSettingsForm {
  shopName: string;
  shopDescription: string;
  logoUrl: string;
  bannerUrl: string;
  wilaya: string;
}

export const ShopSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  
  const [shopData, setShopData] = useState<ShopSettingsForm>({
    shopName: typeof userProfile?.shopName === 'string' ? userProfile.shopName : (typeof userProfile?.displayName === 'string' ? userProfile.displayName : ''),
    shopDescription: typeof userProfile?.shopDescription === 'string' ? userProfile.shopDescription : '',
    logoUrl: typeof userProfile?.logoUrl === 'string' ? userProfile.logoUrl : (typeof userProfile?.photoURL === 'string' ? userProfile.photoURL : ''),
    bannerUrl: typeof userProfile?.bannerUrl === 'string' ? userProfile.bannerUrl : '',
    wilaya: typeof userProfile?.wilaya === 'string' ? userProfile.wilaya : '01-Adrar',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) {
      toast.error(isArabic ? "مستخدم غير معروف" : "Utilisateur non identifié");
      return;
    }
    
    if (hasExternalChannel(shopData.shopName) || hasExternalChannel(shopData.shopDescription)) {
      toast.error(t("external_channel_blocked", "Les coordonnees de communication exterieure (messages, liens ou reseaux) ne sont pas autorisees dans ce champ de texte. Tout contact doit s'effectuer exclusivement via la plateforme OLMART."));
      return;
    }

    setLoading(true);
    try {
      const safeDescription = maskSensitiveData(shopData.shopDescription || '');
        
      await apiPut("/api/v1/seller/profile/settings", {
        shopName: shopData.shopName,
        shopDescription: safeDescription,
        logoUrl: shopData.logoUrl,
        bannerUrl: shopData.bannerUrl,
        wilaya: shopData.wilaya,
      });

      toast.success(isArabic ? "تم حفظ إعدادات المتجر بنجاح!" : "Paramètres boutique sauvegardés !");
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? "حدث خطأ أثناء الحفظ." : "Erreur de sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleFileChange = (field: 'logoUrl' | 'bannerUrl') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
       toast.error(isArabic ? "الملف كبير جداً (الأقصى 2 ميجابايت)" : "Le fichier est trop lourd (Max 2Mo).");
       return;
    }

    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('../../lib/firebase');

    if (field === 'logoUrl') setUploadingLogo(true);
    if (field === 'bannerUrl') setUploadingBanner(true);

    const loaderId = toast.loading(isArabic ? "جاري رفع الملف..." : "Téléchargement du fichier...");
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileRef = storageRef(storage, `shops/${userProfile?.uid || 'temp'}/${field}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const publicUrl = await getDownloadURL(fileRef);
      setShopData(prev => ({ ...prev, [field]: publicUrl }));
      toast.success(isArabic ? "تم تحديث الملف بنجاح!" : "Fichier mis à jour avec succès !", { id: loaderId });
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      toast.error((isArabic ? "فشل الرفع: " : "Échec de l'upload: ") + errMsg, { id: loaderId });
    } finally {
      if (field === 'logoUrl') setUploadingLogo(false);
      if (field === 'bannerUrl') setUploadingBanner(false);
    }
  };

  const isShopValidated = userProfile?.status === 'ACTIVE' || userProfile?.status === 'active';

  return (
    <div className="max-w-5xl space-y-10">
      {!isShopValidated && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
               <div>
                  <h3 className="font-bold text-sm">{t("Boutique en attente de vérification")}</h3>
                  <p className="text-xs text-amber-700/80">{t("Vous ne pouvez pas modifier le nom de la boutique tant que votre profil n'a pas été validé par l'administration.")}</p>
               </div>
            </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">{t("Paramètres Boutique")}</h2>
          <p className="text-zinc-500 font-medium">{t("Configurez votre identité visuelle.")}</p>
        </div>
      </div>

      {/* Security & 2FA Card */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-sans font-bold text-lg text-white">
                {isArabic ? "أمان الحساب والمصادقة الثنائية (2FA)" : "Sécurité du Compte & Double Authentification (2FA)"}
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                is2FAEnabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {is2FAEnabled ? (isArabic ? "مفعّل" : "ACTIVÉ") : (isArabic ? "غير مفعّل" : "INACTIF")}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium max-w-xl">
              {isArabic
                ? "احمِ حسابك ومتجرك من الوصول غير المصرح به باشتراط رمز OTP بريدي في كل عملية حساسة."
                : "Protégez votre boutique et vos virements en exigeant un code OTP e-mail pour chaque action sensible."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIs2FAModalOpen(true)}
          className="px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>{is2FAEnabled ? (isArabic ? "إدارة أمان 2FA" : "Gérer le 2FA") : (isArabic ? "تفعيل 2FA الآن" : "Activer le 2FA")}</span>
        </button>
      </div>

      <TwoFactorSecurityModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        userEmail={currentUser?.email || userProfile?.email}
        isInitiallyEnabled={is2FAEnabled}
        onStatusChange={(status) => setIs2FAEnabled(status)}
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-10 overflow-hidden">
         <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">{t("Nom Public de la Boutique")}</label>
                       <input required disabled={!isShopValidated} type="text" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold disabled:opacity-50 disabled:cursor-not-allowed" value={shopData.shopName || ''} onChange={(e) => setShopData({...shopData, shopName: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">{t("Wilaya du Magasin Principal")}</label>
                       <select className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold appearance-none cursor-pointer" value={shopData.wilaya || ''} onChange={(e) => setShopData({...shopData, wilaya: e.target.value})}>
                          {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">{t("Slogan / Courte Description")}</label>
                       <textarea rows={3} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-medium resize-none text-sm" value={shopData.shopDescription || ''} onChange={(e) => setShopData({...shopData, shopDescription: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">{t("Logo de la Boutique")}</label>
                       <div className="flex gap-4">
                          <div className="relative flex-1 bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer overflow-hidden p-4">
                             <input type="file" accept="image/*" onChange={handleFileChange('logoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                             <div className="flex flex-col items-center flex-1 text-center gap-1 pointer-events-none">
                                 <Upload className="w-5 h-5 text-zinc-400" />
                                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest rtl:tracking-normal">
                                     {shopData.logoUrl ? "Changer de Logo" : "Uploader votre Logo"}
                                 </span>
                             </div>
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200 flex items-center justify-center text-zinc-300">
                             {shopData.logoUrl ? <img loading="lazy" src={getOptimizedImageUrl(shopData.logoUrl, 200)} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="w-6 h-6" />}
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">{t("Bannière de la Boutique")}</label>
                       <div className="relative overflow-hidden w-full px-5 py-4 bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleFileChange('bannerUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="flex flex-col items-center flex-1 text-center gap-2 pointer-events-none">
                              <Upload className="w-5 h-5 text-zinc-400" />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest rtl:tracking-normal truncate max-w-xs">
                                  {shopData.bannerUrl ? "Changer la Bannière" : "Uploader la Bannière"}
                              </span>
                          </div>
                       </div>
                       {shopData.bannerUrl && (
                         <div className="mt-4 aspect-[4/1] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                            <img loading="lazy" src={getOptimizedImageUrl(shopData.bannerUrl, 800)} className="w-full h-full object-cover" alt="" />
                         </div>
                       )}
                    </div>
                 </div>
              </div>
              <button type="submit" disabled={loading || uploadingLogo || uploadingBanner} className="w-full bg-zinc-950 text-white py-5 rounded-[2rem] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-sm hover:bg-zinc-900 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                 <Save className="w-5 h-5" />
                 {loading ? 'Sauvegarde...' : (uploadingLogo || uploadingBanner) ? 'Transfert d\'image en cours...' : 'Sauvegarder le Profil'}
              </button>
           </form>
        </motion.div>
    </div>
  );
};
