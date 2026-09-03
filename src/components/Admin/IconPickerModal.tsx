import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check, Sparkles } from 'lucide-react';
import {
  ICON_CATALOG,
  getAppIconComponent,
  IconDefinition
} from '../../utils/iconRegistry';
import { IconPreviewPanel } from './IconPreviewPanel';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIcon: string;
  currentGradient?: string;
  currentBadgeColor?: string;
  currentBadgeText?: string;
  appTitle?: string;
  onApply: (selected: {
    icon: string;
    gradient: string;
    badgeColor: string;
    badgeText: string;
  }) => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  currentIcon,
  currentGradient = 'from-sky-400 via-blue-500 to-indigo-600',
  currentBadgeColor = 'bg-sky-500 text-white font-bold',
  currentBadgeText = '',
  appTitle = 'Aperçu Raccourci',
  onApply
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon || 'ShoppingBag');
  const [selectedGradient, setSelectedGradient] = useState<string>(currentGradient);
  const [selectedBadgeColor, setSelectedBadgeColor] = useState<string>(currentBadgeColor);
  const [badgeText, setBadgeText] = useState<string>(currentBadgeText);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(ICON_CATALOG.map((i) => i.category)));
    return ['Tous', ...cats];
  }, []);

  const filteredIcons = useMemo(() => {
    return ICON_CATALOG.filter((item: IconDefinition) => {
      const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const PreviewIconComponent = getAppIconComponent(selectedIcon);

  const handleApply = () => {
    onApply({
      icon: selectedIcon,
      gradient: selectedGradient,
      badgeColor: selectedBadgeColor,
      badgeText: badgeText.trim()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Studio Visuel & Bibliothèque d'Icônes</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Personnalisez l'icône, le dégradé premium et le badge pour l'accueil et l'écosystème.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Icon Selection (7 cols) */}
            <div className="lg:col-span-7 p-5 flex flex-col border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher une icône (ex: panier, flash, tech, voiture, artisan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 flex-1 overflow-y-auto pr-1">
                {filteredIcons.map((item) => {
                  const ItemIcon = item.component;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 shadow-md scale-105 ring-2 ring-orange-500/30'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 hover:scale-102'
                      }`}
                      title={item.name}
                    >
                      <ItemIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {item.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Extracted Preview Panel */}
            <IconPreviewPanel
              selectedIcon={selectedIcon}
              selectedGradient={selectedGradient}
              selectedBadgeColor={selectedBadgeColor}
              badgeText={badgeText}
              appTitle={appTitle}
              previewIconComponent={PreviewIconComponent}
              onSelectGradient={setSelectedGradient}
              onSelectBadge={(text, color) => {
                setBadgeText(text);
                setSelectedBadgeColor(color);
              }}
              onBadgeTextChange={setBadgeText}
              onClearBadge={() => setBadgeText('')}
              onClose={onClose}
              onApply={handleApply}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
