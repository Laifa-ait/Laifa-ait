import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Save } from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';
import { IconPickerModal } from './IconPickerModal';
import { AppBasicFormFields } from './AppBasicFormFields';
import { getAppIconComponent } from '../../utils/iconRegistry';

interface AppModuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: OlmaAppModule | null;
  onSave: (app: OlmaAppModule) => void;
}

export const AppModuleEditorModal: React.FC<AppModuleEditorModalProps> = ({
  isOpen,
  onClose,
  app,
  onSave
}) => {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [formData, setFormData] = useState<OlmaAppModule>(() => {
    if (app) return { ...app };
    return {
      id: `app-${Date.now()}`,
      slug: 'nouvelle-app',
      title: { fr: '', ar: '', en: '' },
      description: { fr: '', ar: '', en: '' },
      icon: 'ShoppingBag',
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      badgeColor: 'bg-sky-500 text-white font-bold',
      category: 'ecommerce',
      status: 'active',
      badge: { fr: '', ar: '', en: '' },
      isFeatured: true,
      order: 1,
      targetRoute: '/catalog',
      actionType: 'route',
      showInHomeShortcuts: true
    };
  });

  React.useEffect(() => {
    if (app) {
      setFormData({ ...app });
    } else {
      setFormData({
        id: `app-${Date.now()}`,
        slug: 'nouvelle-app',
        title: { fr: '', ar: '', en: '' },
        description: { fr: '', ar: '', en: '' },
        icon: 'ShoppingBag',
        gradient: 'from-sky-400 via-blue-500 to-indigo-600',
        badgeColor: 'bg-sky-500 text-white font-bold',
        category: 'ecommerce',
        status: 'active',
        badge: { fr: '', ar: '', en: '' },
        isFeatured: true,
        order: 1,
        targetRoute: '/catalog',
        actionType: 'route',
        showInHomeShortcuts: true
      });
    }
  }, [app, isOpen]);

  const IconComponent = getAppIconComponent(formData.icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.fr.trim()) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
          >
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {app ? `Modifier l'application : ${app.title.fr}` : 'Créer un nouveau raccourci / application'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                  <div
                    className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${
                      formData.gradient || 'from-sky-400 to-indigo-600'
                    } flex items-center justify-center text-white shadow-md`}
                  >
                    <IconComponent className="w-7 h-7 stroke-[2.2]" />
                    {formData.badge?.fr && (
                      <span
                        className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs font-extrabold shadow uppercase ${
                          formData.badgeColor || 'bg-red-500 text-white'
                        }`}
                      >
                        {formData.badge.fr}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Icône & Style Visuel
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Icône : <span className="font-semibold text-orange-600">{formData.icon}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIconPickerOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white rounded-2xl transition-all flex items-center gap-1.5 border border-orange-500/30"
                >
                  <Palette className="w-4 h-4" />
                  Choisir l'Icône
                </button>
              </div>

              <AppBasicFormFields
                formData={formData}
                onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
              />

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.showInHomeShortcuts ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, showInHomeShortcuts: e.target.checked })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Afficher dans les Raccourcis Accueil
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Mis en Avant (Featured)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description Courte (Français)
                </label>
                <input
                  type="text"
                  value={formData.description.fr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: { ...formData.description, fr: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-2xl bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer l'Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIcon={formData.icon}
        currentGradient={formData.gradient}
        currentBadgeColor={formData.badgeColor}
        currentBadgeText={formData.badge?.fr || ''}
        appTitle={formData.title.fr || 'Aperçu Raccourci'}
        onApply={({ icon, gradient, badgeColor, badgeText }) => {
          setFormData((prev) => ({
            ...prev,
            icon,
            gradient,
            badgeColor,
            badge: {
              ...prev.badge,
              fr: badgeText,
              ar: prev.badge?.ar || badgeText,
              en: prev.badge?.en || badgeText
            }
          }));
        }}
      />
    </>
  );
};
