import React, { useRef, useState, useEffect, useMemo, useCallback, useId } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface CurvedNavItem<T = string> {
  id: T;
  label?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export interface CurvedBottomNavProps<T = string> {
  items: CurvedNavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  barColor?: string;
  accentColor?: string;
}

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 350,
  damping: 26,
  mass: 0.8,
};

/**
 * CurvedBottomNav - Barre de navigation mobile haut de gamme
 * "Curved Liquid / Jelly Floating Indicator" avec découpe vectorielle dynamique.
 */
export function CurvedBottomNav<T = string>({
  items,
  activeId,
  onChange,
  className = "",
  barColor = "#ffffff",
  accentColor = "#059669",
}: CurvedBottomNavProps<T>): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(375);
  const maskId = useId().replace(/:/g, "_") + "_mask";
  const filterId = useId().replace(/:/g, "_") + "_filter";

  const activeIndex = useMemo(() => {
    const idx = items.findIndex((it) => it.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [items, activeId]);

  const activeItem = items[activeIndex];
  const ActiveIcon = activeItem?.icon;

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [updateWidth]);

  // Répartition équilibrée avec marge latérale pour ne jamais coller aux bordures d'écran
  const count = items.length || 1;
  const paddingX = 8;
  const availableWidth = Math.max(0, containerWidth - paddingX * 2);
  const itemWidth = availableWidth / count;
  const activeCenterX = paddingX + (activeIndex + 0.5) * itemWidth;

  const barHeight = 64;

  return (
    <div
      dir="ltr"
      ref={containerRef}
      className={`relative w-full max-w-md mx-auto select-none ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
    >
      {/* Fond de sécurité pour combler la zone sous les 64px (gestures / home indicator) */}
      <div className="absolute inset-x-0 bottom-0 top-[60px] bg-white pointer-events-none" />

      {/* 1. Structure vectorielle SVG : Barre continue avec masque d'échancrure glissante */}
      <svg
        width={containerWidth}
        height={barHeight + 10}
        className="absolute top-0 left-0 w-full h-[74px] pointer-events-none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id={filterId} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="-4" stdDeviation="7" floodColor="rgba(15, 23, 42, 0.08)" />
            <feDropShadow dx="0" dy="-1" stdDeviation="2" floodColor="rgba(15, 23, 42, 0.04)" />
          </filter>

          <mask id={maskId}>
            {/* Rectangle blanc opaque de base */}
            <rect x="-100" y="0" width="3000" height="200" fill="white" />

            {/* Découpe noire en vague liquide glissant avec spring physics */}
            <motion.g
              animate={{ x: activeCenterX }}
              transition={SPRING_TRANSITION}
            >
              <path
                d="M -46 -4 L -46 0 C -32 0, -22 32, 0 32 C 22 32, 32 0, 46 0 L 46 -4 Z"
                fill="black"
              />
            </motion.g>
          </mask>
        </defs>

        {/* Corps principal de la barre avec échancrure et ombre portée */}
        <rect
          x="0"
          y="0"
          width="100%"
          height={barHeight}
          fill={barColor}
          mask={`url(#${maskId})`}
          filter={`url(#${filterId})`}
        />

        {/* Ligne de bordure supérieure délicate qui longe la barre et épouse le creux */}
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          stroke="#E2E8F0"
          strokeWidth="1.2"
          strokeOpacity="0.85"
          mask={`url(#${maskId})`}
        />

        {/* Tracé de l'échancrure fluide glissant avec spring physics */}
        <motion.g
          animate={{ x: activeCenterX }}
          transition={SPRING_TRANSITION}
        >
          <path
            d="M -46 0 C -32 0, -22 32, 0 32 C 22 32, 32 0, 46 0"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeOpacity="0.85"
          />
        </motion.g>
      </svg>

      {/* 2. Bulle flottante circulaire (Indicateur actif liquide) */}
      <motion.div
        className="absolute -top-5 w-[54px] h-[54px] rounded-full flex items-center justify-center border-[3.5px] border-white pointer-events-none z-20 shadow-[0_10px_24px_-2px_rgba(5,150,105,0.4),0_3px_8px_rgba(15,23,42,0.08)]"
        style={{
          background: `linear-gradient(135deg, #10B981 0%, ${accentColor} 55%, #047857 100%)`,
        }}
        animate={{
          x: activeCenterX - 27,
        }}
        transition={SPRING_TRANSITION}
      >
        <AnimatePresence mode="wait">
          {ActiveIcon && (
            <motion.div
              key={String(activeId)}
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 24 }}
              className="text-white flex items-center justify-center drop-shadow-xs"
            >
              <ActiveIcon className="w-5 h-5 stroke-[2.4]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. Boutons interactifs (icônes uniquement, sans texte) */}
      <div className="relative z-10 flex items-center justify-around h-[64px] w-full px-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <button
              key={String(item.id)}
              onClick={() => {
                onChange(item.id);
                item.onClick?.();
              }}
              aria-label={item.ariaLabel || item.label || String(item.id)}
              className="relative flex-1 h-full flex flex-col items-center justify-center bg-transparent border-none cursor-pointer focus:outline-none select-none transition-transform active:scale-90"
            >
              <motion.div
                animate={{
                  opacity: isActive ? 0 : 0.9,
                  scale: isActive ? 0.3 : 1,
                  y: isActive ? -8 : 0,
                }}
                transition={SPRING_TRANSITION}
                className="relative flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <Icon className="w-5 h-5 stroke-[2]" />

                {/* Badge de notification optionnel */}
                {item.badge !== undefined && item.badge !== false && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
