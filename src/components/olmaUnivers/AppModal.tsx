import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Users,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Send,
  Wrench,
  Home,
  Car,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Briefcase
} from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';
import { registerAppWaitlist } from '../../services/olmaUnivers.api';

interface AppModalProps {
  app: OlmaAppModule | null;
  lang: 'fr' | 'ar' | 'en';
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Home,
  Car,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Briefcase
};

export const AppModal: React.FC<AppModalProps> = ({ app, lang, onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!app) return null;

  const IconComponent = ICON_MAP[app.icon] || Sparkles;
  const title = app.title[lang] || app.title.fr;
  const description = app.longDescription ? (app.longDescription[lang] || app.longDescription.fr) : (app.description[lang] || app.description.fr);

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
              <IconComponent className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Olma Univers Module
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {description}
          </p>

          {app.status === 'active' && app.targetRoute ? (
            <div className="text-center pt-2">
              <a
                href={app.targetRoute}
                className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-opacity"
              >
                Accéder à l'application {title}
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-3">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Rejoindre la liste d'attente prioritaire</span>
              </div>

              {submitted ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{feedbackMsg || 'Merci ! Vous serez notifié dès l\'ouverture officielle.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="Téléphone (ex: 0550...)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Wilaya (ex: Alger)"
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || (!email && !phone)}
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Inscription...' : 'S\'inscrire pour l\'accès Beta'}</span>
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
