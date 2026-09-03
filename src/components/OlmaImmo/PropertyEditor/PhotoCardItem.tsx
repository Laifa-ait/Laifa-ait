import React from 'react';
import { Star, Trash2, ArrowLeft, ArrowRight, Eye } from 'lucide-react';

interface PhotoCardItemProps {
  img: string;
  index: number;
  total: number;
  isMain: boolean;
  onSetMain: (index: number) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onRemove: (index: number) => void;
  onPreview: (img: string) => void;
}

export const PhotoCardItem: React.FC<PhotoCardItemProps> = ({
  img,
  index,
  total,
  isMain,
  onSetMain,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onPreview,
}) => {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-stone-900 shadow-xs ${
        isMain ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-stone-200 hover:border-emerald-600'
      }`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          loading="lazy"
          decoding="async"
          src={img}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isMain ? (
            <span className="flex items-center gap-1 bg-[#1a3831] text-[#ebdcb8] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-400/50 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Photo Principale</span>
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              N° {index + 1}
            </span>
          )}
        </div>

        {/* Action button bar (Visible on hover and on mobile) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onPreview(img)}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer shadow-sm"
            title="Agrandir la photo"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-sm"
            title="Supprimer cette photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom toolbar for reordering and setting main */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 z-10 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {!isMain ? (
            <button
              type="button"
              onClick={() => onSetMain(index)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-[#1a3831] rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Mettre en premier</span>
            </button>
          ) : (
            <span className="text-[10px] text-amber-300 font-semibold px-1">Couverture</span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {index > 0 && (
              <button
                type="button"
                onClick={() => onMoveLeft(index)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer shadow-sm"
                title="Déplacer vers la gauche"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {index < total - 1 && (
              <button
                type="button"
                onClick={() => onMoveRight(index)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer shadow-sm"
                title="Déplacer vers la droite"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
