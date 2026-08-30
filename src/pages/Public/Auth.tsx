import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Key, User, CheckCircle2, ShieldCheck, ScrollText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword
} from "firebase/auth";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { OlmaLogo } from "../../components/Navbar";
import { apiGet } from "../../lib/api";

export const Auth: React.FC = () => {
  const { currentUser, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">("buyer");

  // Premium UI & Verification States (Module 5)
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const [registrationRules, setRegistrationRules] = useState("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [rulesValidated, setRulesValidated] = useState(false);
  const rulesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiGet<{ registrationRules?: string }>('/api/v1/settings/global');
        if (data && data.registrationRules) {
          setRegistrationRules(data.registrationRules);
        }
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleScroll = () => {
    if (rulesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rulesContainerRef.current;
      // Allow a 5px margin of error
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (!isLogin && registrationRules && rulesContainerRef.current) {
      const { scrollHeight, clientHeight } = rulesContainerRef.current;
      if (scrollHeight <= clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  }, [isLogin, registrationRules]);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (currentUser) {
      if (!currentUser.emailVerified) {
        navigate('/verify-email');
        return;
      }
      
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }

      if (!isLogin) {
         navigate('/');
      } else {
         if (window.history.length > 2) {
           navigate(-1);
         } else {
           navigate('/');
         }
      }
    }
  }, [currentUser, navigate, isLogin, redirectPath]);

  if (currentUser) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle(selectedRole);
      toast.success(t("login_success", "Connexion réussie !"));
    } catch (error: unknown) {
      const errCode = (error && typeof error === "object" && "code" in error && typeof (error as { code: unknown }).code === "string")
        ? (error as { code: string }).code
        : "";
      const errMsg = (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string")
        ? (error as { message: string }).message
        : "";

      if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled-popup-request') {
        // User voluntarily dismissed popup, no error toast needed
      } else if (errCode === 'auth/popup-blocked') {
        toast.error(t("auth_error_popup_blocked", "Veuillez autoriser les fenêtres pop-up dans votre navigateur pour vous connecter avec Google."));
      } else if (errCode === 'auth/unauthorized-domain') {
        toast.error(t("auth_error_unauthorized_domain", "Ce domaine n'est pas encore autorisé dans Firebase Console (Authentication > Paramètres > Domaines autorisés). Vous pouvez vous connecter avec Email et Mot de passe ci-dessus."));
      } else if (errCode === 'auth/operation-not-allowed') {
        toast.error(t("auth_error_op_not_allowed", "La connexion Google n'est pas activée dans Firebase Console (Authentication > Sign-in method > Google)."));
      } else if (errCode === 'auth/invalid-api-key' || errCode === 'auth/api-key-not-valid') {
        toast.error(t("auth_error_invalid_key", "Configuration Firebase VITE_FIREBASE_API_KEY requise. Utilisez la connexion classique par Email / Mot de passe ci-dessus."));
      } else if (errCode === 'auth/network-request-failed') {
        toast.error(t("auth_error_network_request_failed", "Erreur réseau. Veuillez vérifier votre connexion internet et réessayer."));
      } else {
        console.error("Erreur de connexion Google:", error);
        toast.error(errMsg ? `Échec Google : ${errMsg}` : t("google_login_failed", "La connexion avec Google a échoué. Utilisez la connexion par Email et Mot de passe ci-dessus."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !name.trim()) {
        toast.error(t("auth.error.name_required") || "Veuillez saisir votre nom complet.");
        setLoading(false);
        return;
    }

    if (!isLogin) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        toast.error("Le mot de passe doit faire au moins 8 caractères, inclure une majuscule, une minuscule, un chiffre et un caractère spécial.");
        setLoading(false);
        return;
      }
    }

    if (!isLogin && registrationRules && !cgvAccepted) {
        toast.error(t("auth.error.read_rules") || "Veuillez lire et accepter les conditions d'inscription.");
        setLoading(false);
        return;
    }

    const getLocalizedAuthErrorMessage = (code: string): string => {
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          return t("auth_error_invalid_credential", "Email ou mot de passe incorrect.");
        case 'auth/user-not-found':
          return t("auth_error_user_not_found", "Aucun compte existant pour cet e-mail.");
        case 'auth/email-already-in-use':
          return t("auth_error_email_already_in_use", "Cet e-mail est déjà utilisé par un autre compte.");
        case 'auth/weak-password':
          return t("auth_error_weak_password", "Le mot de passe est trop faible (6 caractères minimum).");
        case 'auth/invalid-email':
          return t("auth_error_invalid_email", "L'adresse e-mail saisie est de format incorrect.");
        case 'auth/too-many-requests':
          return t("auth_error_too_many_requests", "Trop de tentatives échouées. Par sécurité, votre accès est temporairement bloqué. Réessayez plus tard.");
        case 'auth/user-disabled':
          return t("auth_error_user_disabled", "Ce compte a été suspendu. Veuillez contacter le support technique d'OLMART.");
        case 'auth/network-request-failed':
          return t("auth_error_network_request_failed", "Erreur réseau. Veuillez vérifier votre connexion internet et réessayer.");
        case 'auth/internal-error':
          return t("auth_error_internal", "Une erreur interne s'est produite lors de la connexion.");
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          return t("auth_error_popup_closed", "La fenêtre d'authentification a été fermée.");
        default:
          return t("auth_error_generic", "Erreur d'authentification. Veuillez réessayer.");
      }
    };

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success(t("welcome_back", "Content de vous revoir !"));
      } else {
        localStorage.setItem("olmart_pending_registration_role", selectedRole);
        await signUpWithEmail(email, password, name, selectedRole);
        toast.success(t("account_created_success", "Compte créé avec succès ! Veuillez vérifier votre email."));
      }
    } catch (err: unknown) {
      console.error("Erreur d'authentification:", err);
      const errorCode = (err && typeof err === "object" && "code" in err && typeof (err as { code: unknown }).code === "string")
        ? (err as { code: string }).code
        : "";
      toast.error(getLocalizedAuthErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex text-cyan-950 bg-transparent selection:bg-pink-600/20 selection:text-pink-600">
      
      {/* Côté Gauche - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#F2FAFB] overflow-hidden items-center justify-center p-12 border-r border-cyan-900/10">
         <div className="absolute inset-0">
            <img loading="lazy" 
              src="/images/placeholders/product.svg" 
              alt={t("Marketplace") || "Marketplace"} 
              className="w-full h-full object-cover opacity-90 scale-105"
            />
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/80 via-cyan-900/20 to-transparent"></div>
            
            {/* Asian-style / Bougainvillea floral borders using absolute positioned SVGs or decorative elements */}
            {/* Top Left Branch */}
            <svg className="absolute top-0 left-0 w-64 h-64 text-pink-600/80 drop-shadow-lg -translate-x-1/4 -translate-y-1/4 rotate-12" viewBox="0 0 200 200" fill="currentColor">
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.8) translate(20px, 20px)", opacity: 0.8}} />
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.5) translate(-40px, 60px)", fill: "#D92B6B"}} />
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.4) translate(120px, -20px)", fill: "#ff6b9e"}} />
               <path d="M0 0 Q 50 100 200 200" stroke="#4a2e2a" strokeWidth="8" fill="none" style={{transform: "translate(-20px, -20px)"}} />
               <path d="M50 0 Q 80 80 150 150" stroke="#4a2e2a" strokeWidth="6" fill="none" style={{transform: "translate(-10px, -10px)"}} />
            </svg>

            {/* Bottom Right Branch */}
            <svg className="absolute bottom-0 right-0 w-72 h-72 text-pink-500/80 drop-shadow-lg translate-x-1/4 translate-y-1/4 -rotate-45" viewBox="0 0 200 200" fill="currentColor">
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.8) translate(20px, 20px)", opacity: 0.9, fill: "#D92B6B"}} />
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.6) translate(-30px, 80px)", fill: "#ff4d88"}} />
               <path d="M100 0 C120 40, 180 50, 200 100 C150 90, 110 120, 100 200 C80 150, 20 140, 0 100 C50 110, 90 80, 100 0 Z" style={{transform: "scale(0.4) translate(140px, -10px)", fill: "#ff8cba"}} />
               <path d="M0 0 Q 100 50 200 200" stroke="#4a2e2a" strokeWidth="10" fill="none" style={{transform: "translate(-20px, -20px)"}} />
            </svg>
         </div>

         {/* Contenu Décoratif (Glassmorphism clair) */}
         <div className="relative z-10 w-full max-w-lg mt-[15vh]">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="backdrop-blur-xl bg-white/80 border border-white/60 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
               {/* Decorative corner inside card */}
               <div className="absolute top-0 right-0 p-4 opacity-30 text-pink-500 pointer-events-none">
                  <svg className="w-12 h-12" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 0 C60 20, 90 25, 100 50 C75 45, 55 60, 50 100 C40 75, 10 70, 0 50 C25 55, 45 40, 50 0 Z" />
                  </svg>
               </div>

               <div className="w-16 h-16 bg-[#0088A8] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-cyan-900/20 border border-cyan-400/30">
                  <OlmaLogo className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-4xl text-cyan-950 font-display font-bold tracking-tight rtl:tracking-normal mb-4">
                  {t("OLMA")}<br/><span className="text-pink-600 text-3xl font-serif italic">{t("Marketplace")}</span>
               </h1>
               <p className="text-lg text-cyan-900/70 font-medium leading-relaxed">
                  {t("auth.sidebar.description") || "Découvrez la plus grande marketplace des 58 Wilayas. Rejoignez notre communauté !"}
               </p>

               <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-cyan-950 font-bold">
                     <CheckCircle2 className="w-5 h-5 text-pink-600" />
                     {t("auth.sidebar.secure_payment") || "Paiement 100% sécurisé"}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-cyan-950 font-bold">
                     <CheckCircle2 className="w-5 h-5 text-pink-600" />
                     {t("auth.sidebar.delivery_dz") || "Livraison partout en Algérie"}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-cyan-950 font-bold">
                     <CheckCircle2 className="w-5 h-5 text-pink-600" />
                     {t("auth.sidebar.support_7j") || "Support client 7j/7"}
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Côté Droit - Formulaire */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 md:px-24 py-12 relative overflow-hidden bg-transparent">
         {/* Décoration subtile en arrière-plan */}
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-pink-100 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
         <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-cyan-50 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
         
         <div className="w-full max-w-md mx-auto z-10">
            {/* Header Mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
                <div className="w-12 h-12 bg-[#0088A8] rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
                   <OlmaLogo className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-display font-bold tracking-tighter rtl:tracking-normal text-cyan-950">{t("OLMA")}</span>
            </div>

            {/* Titre dynamique */}
            <div className="mb-10 text-center xl:text-start">
               <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight rtl:tracking-normal text-cyan-950 mb-3">
                  {isLogin ? (t("auth.login_title") || "Heureux de vous revoir") : (t("auth.signup_title") || "Créer un compte")}
               </h2>
               <p className="text-cyan-900/70 font-medium text-sm sm:text-base">
                  {isLogin ? (t("auth.login_subtitle") || "Connectez-vous pour continuer vos achats.") : (t("auth.signup_subtitle") || "Rejoignez Olma et commencez l'aventure.")}
               </p>
            </div>

            <div className="relative">
                {/* Onglets */}
                <div className="flex bg-[#F2FAFB] p-1.5 rounded-2xl mb-8 border border-[#E8F6F8]">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                      isLogin ? 'bg-white text-cyan-950 shadow-sm border border-[#E8F6F8]' : 'text-cyan-900/60 hover:text-cyan-950'
                    }`}
                  >
                    {t("auth.tab_login") || "Connexion"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                      !isLogin ? 'bg-white text-cyan-950 shadow-sm border border-[#E8F6F8]' : 'text-cyan-900/60 hover:text-cyan-950'
                    }`}
                  >
                    {t("auth.tab_signup") || "Inscription"}
                  </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        key="role-select"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-4 mb-2"
                      >
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-800/60 block ps-1">
                           {t("i_want_to_be", "Je souhaite être")}
                         </label>
                         <div className="flex bg-[#F2FAFB] rounded-2xl p-1.5 border border-[#E8F6F8]">
                           <button
                             type="button"
                             onClick={() => setSelectedRole('buyer')}
                             className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rtl:tracking-normal rounded-xl transition-all border border-transparent ${
                               selectedRole === 'buyer' 
                                 ? 'bg-white text-cyan-950 shadow-sm border-[#E8F6F8]' 
                                 : 'text-cyan-900/60 hover:text-cyan-950'
                             }`}
                           >
                             {t("buyer_role", "Acheteur")}
                           </button>
                           <button
                             type="button"
                             onClick={() => setSelectedRole('seller')}
                             className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rtl:tracking-normal rounded-xl transition-all border border-transparent ${
                               selectedRole === 'seller' 
                                 ? 'bg-[#0088A8] text-white shadow-md shadow-cyan-900/20 border-cyan-600/50' 
                                 : 'text-cyan-900/60 hover:text-[#0088A8]'
                             }`}
                           >
                             {t("seller_role", "Vendeur")}
                           </button>
                         </div>
                      </motion.div>
                    )}

                    {!isLogin && (
                      <motion.div
                        key="name-input"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="relative group">
                           <User className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-900/40 group-focus-within:text-pink-600 transition-colors pointer-events-none" />
                           <input 
                              type="text" 
                              aria-label={t("auth.placeholder_name") || "Nom complet"}
                              placeholder={t("auth.placeholder_name") || "Nom complet"} 
                              required={!isLogin} 
                              value={name} 
                              onChange={(e) => setName(e.target.value)} 
                              className="w-full bg-white border border-[#E8F6F8] rounded-2xl ltr:pl-12 rtl:pr-12 ltr:pr-5 rtl:pl-5 py-4 text-cyan-950 placeholder:text-cyan-900/40 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-600/10 transition-all font-semibold shadow-sm" 
                           />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="relative group">
                    <Mail className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-900/40 group-focus-within:text-pink-600 transition-colors pointer-events-none" />
                    <input 
                        type="email" 
                        aria-label={t("auth.placeholder_email") || "Adresse e-mail"}
                        placeholder={t("auth.placeholder_email") || "Adresse e-mail"} 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full bg-white border border-[#E8F6F8] rounded-2xl ltr:pl-12 rtl:pr-12 ltr:pr-5 rtl:pl-5 py-4 text-cyan-950 placeholder:text-cyan-900/40 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-600/10 transition-all font-semibold shadow-sm" 
                    />
                  </div>
                  
                  <div className="relative group">
                    <Key className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-900/40 group-focus-within:text-pink-600 transition-colors pointer-events-none" />
                    <input 
                        type="password" 
                        aria-label={t("auth.placeholder_password") || "Mot de passe"}
                        placeholder={t("auth.placeholder_password") || "Mot de passe"} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full bg-white border border-[#E8F6F8] rounded-2xl ltr:pl-12 rtl:pr-12 ltr:pr-5 rtl:pl-5 py-4 text-cyan-950 placeholder:text-cyan-900/40 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-600/10 transition-all font-semibold shadow-sm" 
                    />
                  </div>
                  
                  {isLogin && (
                     <div className="flex justify-end pt-1">
                          <button
                           type="button"
                           onClick={handleForgotPassword}
                           className="text-xs font-bold text-cyan-900/70 hover:text-pink-600 transition-colors"
                        >
                           {t("auth.forgot_password") || "Mot de passe oublié ?"}</button>
                     </div>
                  )}

                  {!isLogin && registrationRules && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 flex flex-col space-y-3 bg-white p-4 rounded-2xl border border-[#E8F6F8] shadow-sm"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-950 flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-pink-600" />
                        {t("auth.rules_title") || "Conditions d'inscription"}
                      </label>
                      
                      <button 
                        type="button"
                        onClick={() => setShowRulesModal(true)}
                        className={`text-start text-sm font-bold underline transition-colors ${rulesValidated ? 'text-emerald-600 hover:text-emerald-700' : 'text-pink-600 hover:text-pink-700'}`}
                      >
                         {rulesValidated ? (t("auth.rules_validated") || "Conditions lues et validées") : (t("auth.rules_read_cta") || "Lire les conditions d'inscription obligatoires")}
                      </button>
                      
                      <div className="flex items-start gap-3 mt-2 pt-2 border-t border-[#E8F6F8]">
                         <input 
                           type="checkbox" 
                           id="cgv-checkbox"
                           checked={cgvAccepted}
                           onChange={(e) => setCgvAccepted(e.target.checked)}
                           disabled={!rulesValidated}
                           className="mt-1 w-4 h-4 text-[#0088A8] border-cyan-300 rounded focus:ring-[#0088A8] disabled:opacity-40 disabled:cursor-not-allowed"
                         />
                         <label htmlFor="cgv-checkbox" className={`text-xs font-semibold ${!rulesValidated ? 'text-cyan-900/40 cursor-not-allowed' : 'text-cyan-950 cursor-pointer'}`}>
                           {t("auth.accept_rules") || "J'accepte les conditions d'inscription."}
                           {!rulesValidated && (
                             <span className="block mt-1 text-pink-600 font-bold">{t("auth.read_rules_first") || "Veuillez d'abord lire le texte des conditions."}</span>
                           )}
                         </label>
                      </div>
                    </motion.div>
                  )}

                  <button 
                     type="submit" 
                     disabled={loading || Boolean(!isLogin && registrationRules && !cgvAccepted)}
                     className="w-full mt-6 py-4 bg-[#0088A8] text-white rounded-2xl font-bold uppercase tracking-[0.2em] rtl:tracking-normal flex items-center justify-center gap-3 text-xs hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group border border-cyan-600/50"
                  >
                     {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        isLogin ? (t("auth.btn_login") || "Se Connecter") : (selectedRole === 'seller' ? (t("auth.btn_apply_seller") || "Soumettre ma candidature vendeur") : (t("auth.btn_signup") || "S'inscrire"))
                     )}
                  </button>
                  
                  {!isLogin && selectedRole === 'seller' && (
                     <p className="text-center text-xs text-cyan-900/60 mt-4 font-medium">
                        {t("auth.seller_disclaimer") || "Votre candidature vendeur sera examinée sous 24h à 48h par l'équipe Olmart."}
                     </p>
                  )}
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8F6F8]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-cyan-800/40 font-bold uppercase tracking-[0.2em] text-[10px]">
                       {t("auth.oauth_divider") || "Ou continuer avec"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  disabled={loading || Boolean(!isLogin && registrationRules && !cgvAccepted)}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-white border border-[#E8F6F8] rounded-2xl hover:bg-[#F2FAFB] hover:border-cyan-200 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group text-cyan-950"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-bold">{t("Google")}</span>
                </button>
            </div>
         </div>
      </div>

      {showRulesModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            <div className="p-6 border-b border-[#E8F6F8] flex items-center justify-between shrink-0 bg-white z-10 sticky top-0">
               <h2 className="text-xl font-display font-bold text-cyan-950 flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-pink-600" />
                 {t("auth.modal.rules_title") || "Conditions d'inscription"}
               </h2>
            </div>
            
            <div 
              className="p-6 overflow-y-auto flex-1 font-medium text-sm text-cyan-900/80 leading-relaxed" 
              ref={rulesContainerRef} 
              onScroll={handleScroll}
            >
              {registrationRules.split('\n').map((line, idx) => (
                 <p key={idx} className="mb-4">{line}</p>
              ))}
            </div>
            
            <div className="p-6 border-t border-[#E8F6F8] bg-[#F2FAFB] shrink-0 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className="text-xs font-bold text-cyan-800/60 max-w-sm">
                {!hasScrolledToBottom 
                  ? (t("auth.modal.scroll_down") || "Vous devez lire le document jusqu'en bas pour pouvoir valider.") 
                  : (t("auth.modal.rules_read_feedback") || "Merci d'avoir pris connaissance de nos conditions.")}
              </p>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="px-6 py-3 font-bold text-cyan-900/60 hover:bg-white rounded-xl transition-colors flex-1 sm:flex-none text-center"
                >
                  {t("common.close") || "Fermer"}
                </button>
                <button
                  type="button"
                  disabled={!hasScrolledToBottom}
                  onClick={() => {
                    setRulesValidated(true);
                    setCgvAccepted(true);
                    setShowRulesModal(false);
                  }}
                  className="px-6 py-3 bg-[#0088A8] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors flex-1 sm:flex-none text-center flex items-center justify-center gap-2"
                >
                  {t("auth.modal.btn_validate") || "J'ai tout lu et je valide"}
                  {hasScrolledToBottom && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};


