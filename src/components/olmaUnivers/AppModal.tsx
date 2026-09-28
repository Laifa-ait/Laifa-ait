import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';
import { registerAppWaitlist } from '../../services/olmaUnivers.api';
import { getAppIconComponent } from '../../utils/iconRegistry';

interface AppModalProps {
  app: OlmaAppModule | null;
  lang: 'fr' | 'ar' | 'en';
  onClose: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({ app, lang, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!app) return null;

  const IconComponent = getAppIconComponent(app.icon);
  const title = app.title[lang] || app.title.fr;
  const description =
    app.longDescription?.[lang] ||
    app.longDescription?.fr ||
    app.description[lang] ||
    app.description.fr;
  const isActive = app.status === 'active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) return;

    setLoading(true);
    const res = await registerAppWaitlist({
      appId: app.id,
      email,
      phone,
      wilaya
    });
    setLoading(false);
    setSubmitted(true);
    setFeedbackMsg(res.message);
  };

  const handleOpenApp = () => {
    onClose();
    if (app.targetRoute) {
      if (app.targetRoute.startsWith('http')) {
        window.open(app.targetRoute, '_blank', 'noopener,noreferrer');
      } else {
        navigate(app.targetRoute);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200"
        >
          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* En-tête de l'application */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                app.gradient || 'from-amber-500 to-orange-600'
              } text-white flex items-center justify-center shadow-sm shrink-0`}
            >
              <IconComponent className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {lang === 'ar' ? 'متوفر الآن' : 'Disponible'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    {lang === 'ar' ? 'قيد التطوير' : 'En cours de création'}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 leading-tight">
                {title}
              </h2>
            </div>
          </div>

          {/* Description claire */}
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6">
            {description}
          </p>

          {/* Action principale */}
          {isActive ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleOpenApp}
                className="w-full py-3.5 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <span>{lang === 'ar' ? 'فتح' : lang === 'en' ? 'Open' : 'Ouvrir'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Plateforme officielle certifiée Olma Écosystème</span>
              </p>
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200/80">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900 mb-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>{lang === 'ar' ? 'حجز وصول مسبق' : 'Rejoindre la liste d\'attente prioritaire'}</span>
              </div>

              {submitted ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{feedbackMsg || 'Merci ! Vous serez averti dès l\'ouverture officielle.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                      <input
                        type="tel"
                        placeholder="N° Téléphone (ex: 0550...)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Wilaya (ex: Alger)"
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || (!email && !phone)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer border-none"
                  >
                    {loading ? 'Inscription en cours...' : "M'inscrire pour l'ouverture"}
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
