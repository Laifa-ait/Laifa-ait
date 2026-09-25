import React from 'react';

interface ElectriciteBatimentArtProps {
  className?: string;
}

export const ElectriciteBatimentArt: React.FC<ElectriciteBatimentArtProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 flex items-center justify-center ${className}`}
      id="art-electricite-batiment"
    >
      {/* Ambient background glow: Electrical gold & high voltage amber */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-yellow-500/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

      {/* Subtle circuit board matrix pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-circuit" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-amber-200" />
            <circle cx="14" cy="14" r="1.5" fill="#f59e0b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-circuit)" />
      </svg>

      {/* Main Stylized Vector Composition */}
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-contain relative z-10 p-2 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="elec-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="elec-cable-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="elec-cable-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="elec-panel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Modular Breaker Panel / Tableau Électrique */}
        <g id="electric-breaker-box" transform="translate(60, 45)">
          <rect x="0" y="0" width="130" height="135" rx="14" fill="url(#elec-panel)" stroke="#475569" strokeWidth="2.5" />
          {/* DIN Rail */}
          <rect x="12" y="32" width="106" height="6" rx="2" fill="#64748b" />
          {/* Circuit Breakers (Disjoncteurs) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${16 + i * 20}, 20)`}>
              <rect x="0" y="0" width="16" height="50" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="3" y="10" width="10" height="12" rx="2" fill={i === 2 ? '#ef4444' : '#22c55e'} />
              <rect x="5" y="30" width="6" height="14" rx="1.5" fill="#f8fafc" />
            </g>
          ))}
          {/* Ground bar */}
          <rect x="15" y="105" width="100" height="10" rx="3" fill="#ca8a04" opacity="0.8" />
        </g>

        {/* Twisted Electrical Cables Routing to Node */}
        <path d="M 190 75 C 230 75, 230 110, 270 110" stroke="url(#elec-cable-red)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 190 100 C 230 100, 230 135, 270 135" stroke="url(#elec-cable-blue)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 190 125 C 230 125, 230 160, 270 160" stroke="#eab308" strokeWidth="6" strokeLinecap="round" />

        {/* Central High-Voltage Energy Spark (Éclair Stylisé) */}
        <g id="spark-bolt" transform="translate(305, 55)">
          <circle cx="20" cy="50" r="42" fill="#eab308" opacity="0.2" filter="blur(8px)" />
          <path
            d="M 32 10 L 8 55 L 22 55 L 8 95 L 42 45 L 26 45 Z"
            fill="url(#elec-gold)"
            filter="drop-shadow(0 0 16px rgba(250,204,21,0.9))"
          />
          <path
            d="M 28 22 L 15 52 L 24 52 L 15 78 L 34 47 L 24 47 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>
      </svg>

      {/* Elegant Artistic Glassmorphism Label Badge */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[10px] font-extrabold tracking-wide shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Création Artistique 3D
      </div>
    </div>
  );
};
