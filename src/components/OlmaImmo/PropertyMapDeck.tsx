import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../../types/realEstate';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyMapDeckProps {
  properties: Property[];
  selectedPropertyId?: string;
  onSelectProperty: (id: string) => void;
  show: boolean;
}

export const PropertyMapDeck: React.FC<PropertyMapDeckProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  show,
}) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedPropertyId && carouselRef.current) {
      const cardEl = carouselRef.current.querySelector(`[data-card-id="${selectedPropertyId}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedPropertyId]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="absolute bottom-4 left-2 right-2 sm:left-4 sm:right-4 z-30 pointer-events-none"
        >
          <div
            ref={carouselRef}
            className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-2 scrollbar-none pointer-events-auto"
          >
            {properties.slice(0, 15).map((p) => {
              const isSelected = selectedPropertyId === p.id;
              return (
                <div
                  key={p.id}
                  data-card-id={p.id}
                  onClick={() => onSelectProperty(p.id)}
                  className={`shrink-0 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border transition-all cursor-pointer shadow-lg hover:shadow-xl ${
                    isSelected
                      ? 'border-[#0D281E] ring-2 ring-[#0D281E] scale-[1.02]'
                      : 'border-[#E6E0D4] hover:border-stone-400'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                        {p.wilaya}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {p.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-black text-[#0D281E]">
                          {p.price.toLocaleString()} DZD
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/immo/property/${p.id}`);
                          }}
                          className="p-1.5 rounded-lg bg-[#0D281E] text-[#EBDCB8] hover:bg-[#153e31] transition"
                          title="Voir le bien"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
