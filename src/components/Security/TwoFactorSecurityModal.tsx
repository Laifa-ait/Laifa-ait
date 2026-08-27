/* eslint-disable max-lines */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, ShieldAlert, KeyRound, Mail, 
  Copy, Download, RefreshCw, CheckCircle2, X, Laptop
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";
import { generateBackupCodes } from "../../utils/twoFactor";
import { safeLogger } from "../../utils/logger";

interface TwoFactorSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isInitiallyEnabled?: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export const TwoFactorSecurityModal: React.FC<TwoFactorSecurityModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  isInitiallyEnabled = false,
  onStatusChange,
}) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const [step, setStep] = useState<"overview" | "enter_pin" | "backup_codes">(
    isInitiallyEnabled ? "overview" : "overview"
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(isInitiallyEnabled);
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync state if props change
  useEffect(() => {
    setIsEnabled(isInitiallyEnabled);
  }, [isInitiallyEnabled]);

  // Handle resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Trigger sending OTP code via backend endpoint /api/v1/auth/2fa/send-code
  const handleSendCode = async () => {
    setLoading(true);
    try {
      await apiPost("/api/v1/auth/2fa/send-code", {});
      toast.success(
        isArabic
          ? "تم ارسال رمز التحقق الى بريدك الالكتروني!"
          : "Code de vérification envoyé à votre adresse email !"
      );
      setStep("enter_pin");
      setResendTimer(60);
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: unknown) {
      safeLogger.error("2FA Send Code Error", { err: error instanceof Error ? error.message : String(error) });
      const errMsg = error instanceof Error ? error.message : undefined;
      toast.error(
        errMsg ||
          (isArabic
            ? "فشل ارسال رمز التحقق. يرجى المحاولة لاحقاً."
            : "Impossible d'envoyer le code. Veuillez réessayer.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP input digits
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newPin = [...pin];
      digits.forEach((d, idx) => {
        if (idx < 6) newPin[idx] = d;
      });
      setPin(newPin);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-advance to next input field
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify PIN via backend endpoint /api/v1/auth/2fa/verify
  const handleVerifyPin = async () => {
    const fullPin = pin.join("");
    if (fullPin.length < 6) {
      toast.error(
        isArabic ? "يرجى إدخال الرمز المكون من 6 أرقام" : "Veuillez saisir le code complet à 6 chiffres"
      );
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/v1/auth/2fa/verify", { code: fullPin });
      
      const generated = generateBackupCodes();
      setBackupCodes(generated);
      setIsEnabled(true);
      if (onStatusChange) onStatusChange(true);
      
      toast.success(
        isArabic
          ? "تم تفعيل المصادقة الثنائية بنجاح! 🔒"
          : "Double authentification 2FA activée avec succès ! 🔒"
      );
      setStep("backup_codes");
    } catch (error: unknown) {
      safeLogger.error("2FA Verify Error", { err: error instanceof Error ? error.message : String(error) });
      const errMsg = error instanceof Error ? error.message : undefined;
      toast.error(
        errMsg ||
          (isArabic
            ? "رمز غير صحيح أو منتهي الصلاحية."
            : "Code invalide ou expiré. Réessayez.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const handleCopyBackupCodes = () => {
    const text = `=== OLMART ALGERIE - CODES DE SECOURS 2FA ===\nCompte: ${userEmail || "Utilisateur Olmart"}\n\n` + 
      backupCodes.map((c, idx) => `${idx + 1}. ${c}`).join("\n") +
      `\n\nConservez ces codes dans un endroit sûr et confidentiel.`;
    navigator.clipboard.writeText(text);
    toast.success(
      isArabic ? "تم نسخ رموز الطوارئ إلى الحافظة!" : "Codes de secours copiés dans le presse-papier !"
    );
  };

  // Download backup codes text file
  const handleDownloadBackupCodes = () => {
    const text = `=== OLMART ALGERIE - CODES DE SECOURS 2FA ===\nCompte: ${userEmail || "Utilisateur Olmart"}\nDate: ${new Date().toLocaleDateString("fr-FR")}\n\n` + 
      backupCodes.map((c, idx) => `${idx + 1}. ${c}`).join("\n") +
      `\n\nConservez ces codes dans un endroit sûr et confidentiel.`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `olmart-codes-secours-2fa-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(
      isArabic ? "تم تحميل ملف الرموز بنجاح!" : "Fichier de codes téléchargé avec succès !"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-zinc-100 max-w-lg w-full overflow-hidden relative"
      >
        {/* Header bar */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-white">
                {isArabic ? "مركز الأمان & المصادقة الثنائية 2FA" : "Sécurité & Double Authentification 2FA"}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                {userEmail ? maskEmail(userEmail) : "Protection renforcée du compte Olmart"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Security Status Box */}
                <div
                  className={`p-5 rounded-2xl border flex items-center justify-between ${
                    isEnabled
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-amber-50 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {isEnabled ? (
                      <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-sans font-bold text-sm">
                        {isEnabled
                          ? isArabic
                            ? "المصادقة الثنائية مفعّلة"
                            : "2FA Activé & Sécurisé"
                          : isArabic
                          ? "المصادقة الثنائية غير مفعّلة"
                          : "2FA Non Activé (Recommandé)"}
                      </p>
                      <p className="text-xs font-medium opacity-80">
                        {isEnabled
                          ? isArabic
                            ? "حسابك محمي برمز تحقق OTP في كل تسجيل دخول حساس."
                            : "Votre compte est protégé par un code OTP sécurisé."
                          : isArabic
                          ? "قم بتفعيل 2FA لحماية محفظتك ومتجرك من الوصول غير المصرح به."
                          : "Activez le 2FA pour protéger vos transactions et accès vendeurs."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{isArabic ? "حماية الحساب والمتجر والمعاملات المالية" : "Protection du compte et des transactions financières"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{isArabic ? "تأكيد بريد OTP مجاني وسريع في الجزائر" : "Validation OTP par e-mail sécurisé instantané"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{isArabic ? "رموز الطوارئ الاحتياطية في حال فقدان الوصول" : "Codes de secours imprimables en cas d'urgence"}</span>
                  </div>
                </div>

                {/* Active Device Session Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-zinc-500" />
                    {isArabic ? "الجلسة الحالية والجاهزية" : "Session Active & Conformité"}
                  </h4>
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-zinc-800">
                        {isArabic ? "متصفح الويب الحالي (جلسة نشطة)" : "Navigateur Web Actuel (Session Active)"}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      {isArabic ? "موثوق" : "VÉRIFIÉ"}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-zinc-950 hover:bg-zinc-900 text-white font-sans font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>
                    {isEnabled
                      ? isArabic
                        ? "إعادة ضبط وتوليد رمز تحقق جديد"
                        : "Configurer à nouveau / Tester le 2FA"
                      : isArabic
                      ? "تفعيل المصادقة الثنائية الآن"
                      : "Activer la double authentification (2FA)"}
                  </span>
                </button>
              </motion.div>
            )}

            {step === "enter_pin" && (
              <motion.div
                key="enter_pin"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 text-center"
              >
                <div className="p-3 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center border border-indigo-100">
                  <Mail className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="font-sans font-bold text-lg text-zinc-900">
                    {isArabic ? "أدخل رمز التحقق (OTP)" : "Saisissez le code de vérification"}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isArabic
                      ? "تم إرسال رمز مكون من 6 أرقام إلى بريدك الإلكتروني. أدخله أدناه للتحقق."
                      : "Un code à 6 chiffres a été envoyé à votre e-mail. Saisissez-le ci-dessous."}
                  </p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2.5 dir-ltr">
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-14 text-center font-mono font-bold text-xl bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                {/* Verify & Resend buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleVerifyPin}
                    disabled={loading || pin.join("").length < 6}
                    className="w-full py-3.5 px-6 bg-zinc-950 hover:bg-zinc-900 text-white font-sans font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{isArabic ? "تأكيد الرمز وتفعيل 2FA" : "Valider le code et Activer le 2FA"}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs font-bold pt-2">
                    <button
                      onClick={() => setStep("overview")}
                      className="text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {isArabic ? "← العودة" : "← Retour"}
                    </button>

                    <button
                      onClick={handleSendCode}
                      disabled={resendTimer > 0 || loading}
                      className="text-indigo-600 hover:text-indigo-800 disabled:text-zinc-400 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      <span>
                        {resendTimer > 0
                          ? `${isArabic ? "إعادة الإرسال بعد" : "Renvoyer dans"} ${resendTimer}s`
                          : isArabic
                          ? "إعادة إرسال الرمز"
                          : "Renvoyer un nouveau code"}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "backup_codes" && (
              <motion.div
                key="backup_codes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-sans font-bold text-sm">
                      {isArabic ? "تهانينا! اكتمل تفعيل المصادقة الثنائية" : "2FA Activé avec Succès !"}
                    </h4>
                    <p className="text-xs opacity-90">
                      {isArabic
                        ? "قم بالحفاظ على رموز الطوارئ التالية في مكان آمن لاستخدامها في حال تعذر الوصول إلى بريدك."
                        : "Sauvegardez vos codes de secours pour vous connecter si vous perdez l'accès à votre e-mail."}
                    </p>
                  </div>
                </div>

                {/* Grid of backup codes */}
                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-3 pb-2 border-b border-zinc-800">
                    <span>{isArabic ? "رموز الطوارئ (تستخدم مرة واحدة)" : "CODES DE SECOURS (USAGE UNIQUE)"}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      8 CODES
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm font-bold text-center">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-zinc-800/80 rounded-xl border border-zinc-700/50 text-emerald-400 tracking-wider"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download and copy buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyBackupCodes}
                    className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-zinc-600" />
                    <span>{isArabic ? "نسخ الرموز" : "Copier les codes"}</span>
                  </button>

                  <button
                    onClick={handleDownloadBackupCodes}
                    className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>{isArabic ? "تحميل الملف" : "Télécharger .TXT"}</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white font-sans font-bold text-sm rounded-2xl shadow-lg transition-all"
                >
                  {isArabic ? "إغلاق وإتمام الإعداد" : "Terminer et Fermer"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to mask email address for privacy
function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
}
