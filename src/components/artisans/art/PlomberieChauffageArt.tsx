import React from 'react';

interface PlomberieChauffageArtProps {
  className?: string;
}

export const PlomberieChauffageArt: React.FC<PlomberieChauffageArtProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/70 flex items-center justify-center ${className}`}
      id="art-plomberie-chauffage"
    >
      {/* Ambient background glow: Water blue & Thermal flame amber */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-orange-600/15 blur-2xl pointer-events-none" />

      {/* Subtle isometric background technical grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-plumbing" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-amber-200" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-plumbing)" />
      </svg>

      {/* Main Stylized 3D Artistic Vector Composition */}
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-contain relative z-10 p-2 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Copper Pipe Gradients */}
          <linearGradient id="copper-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="65%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="copper-pipe-h" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="chrome-joint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Water Drop Gradient */}
          <linearGradient id="water-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Flame Gradient */}
          <radialGradient id="flame-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="65%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>

          {/* Dial Face Gradient */}
          <radialGradient id="gauge-face" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="85%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
        </defs>

        {/* 1. Network of polished Copper & Chrome Piping */}
        {/* Horizontal Main Conduit */}
        <g id="conduit-system">
          {/* Lower Shadow */}
          <path d="M 40 148 L 360 148" stroke="#0f172a" strokeWidth="22" strokeLinecap="round" opacity="0.4" />
          {/* Main Copper Pipe */}
          <path d="M 40 142 L 360 142" stroke="url(#copper-pipe-h)" strokeWidth="18" strokeLinecap="round" />
          {/* Specular highlight line */}
          <path d="M 45 137 L 355 137" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

          {/* Vertical Riser to Heating/Chauffage unit */}
          <path d="M 130 142 L 130 58" stroke="url(#copper-main)" strokeWidth="16" strokeLinecap="round" />
          <path d="M 127 142 L 127 60" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

          {/* 90-degree Elbow Joint */}
          <circle cx="130" cy="142" r="14" fill="url(#chrome-joint)" />
          <circle cx="130" cy="142" r="8" fill="#475569" />

          {/* Radiator / Heating Branch */}
          <path d="M 130 58 L 220 58" stroke="url(#copper-pipe-h)" strokeWidth="14" strokeLinecap="round" />
          <circle cx="130" cy="58" r="12" fill="url(#chrome-joint)" />
        </g>

        {/* 2. Stylized Pressure Gauge (Manomètre Chauffage & Pression) */}
        <g id="pressure-gauge" transform="translate(255, 68)">
          {/* Mounting Stem */}
          <rect x="-6" y="28" width="12" height="46" rx="3" fill="url(#copper-main)" />
          <rect x="-9" y="44" width="18" height="8" rx="2" fill="url(#chrome-joint)" />

          {/* Outer Chrome Bezel */}
          <circle cx="0" cy="0" r="38" fill="url(#chrome-joint)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.35))" />
          <circle cx="0" cy="0" r="33" fill="#0f172a" />
          <circle cx="0" cy="0" r="31" fill="url(#gauge-face)" />

          {/* Gauge Ticks */}
          <line x1="-22" y1="0" x2="-16" y2="0" stroke="#64748b" strokeWidth="2" />
          <line x1="16" y1="0" x2="22" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="0" y1="-22" x2="0" y2="-16" stroke="#0284c7" strokeWidth="2.5" />
          <line x1="-15" y1="-15" x2="-10" y2="-10" stroke="#64748b" strokeWidth="2" />
          <line x1="15" y1="-15" x2="10" y2="-10" stroke="#f59e0b" strokeWidth="2" />

          {/* Needle pointing to optimal pressure (bar) */}
          <path d="M -2 4 L 0 -24 L 2 4 Z" fill="#dc2626" />
          <circle cx="0" cy="0" r="5" fill="#1e293b" />
          <circle cx="0" cy="0" r="2" fill="#f8fafc" />

          {/* Glass Specular Flare */}
          <path d="M -22 -12 A 28 28 0 0 1 20 -18 A 28 24 0 0 0 -22 -12 Z" fill="#ffffff" opacity="0.45" />
        </g>

        {/* 3. Artisan Chrome Adjustable Wrench (Clé à Molette) */}
        <g id="artisan-wrench" transform="translate(190, 155) rotate(-22)">
          {/* Handle */}
          <rect x="-10" y="-8" width="130" height="15" rx="7.5" fill="url(#chrome-joint)" filter="drop-shadow(0 8px 14px rgba(0,0,0,0.5))" />
          {/* Ergonomic handle insert */}
          <rect x="25" y="-4" width="75" height="7" rx="3.5" fill="#1e293b" opacity="0.85" />
          {/* Head & Jaws */}
          <circle cx="-12" cy="0" r="20" fill="url(#chrome-joint)" />
          <rect x="-32" y="-12" width="22" height="8" rx="2" fill="#334155" />
          <rect x="-32" y="4" width="22" height="8" rx="2" fill="#334155" />
          {/* Adjusting knurl screw */}
          <circle cx="-6" cy="0" r="7" fill="#f59e0b" />
        </g>

        {/* 4. Crystal Water Droplet (Hydraulique / Sanitaire) */}
        <g id="water-droplet" transform="translate(85, 120)">
          <path
            d="M 0 -28 C 10 -14 20 0 20 12 C 20 23 11 32 0 32 C -11 32 -20 23 -20 12 C -20 0 -10 -14 0 -28 Z"
            fill="url(#water-glow)"
            filter="drop-shadow(0 6px 14px rgba(2,132,199,0.5))"
          />
          {/* Reflection highlight */}
          <ellipse cx="-6" cy="6" rx="5" ry="10" transform="rotate(-25 -6 6)" fill="#ffffff" opacity="0.65" />
          <circle cx="5" cy="18" r="2.5" fill="#ffffff" opacity="0.5" />
        </g>

        {/* 5. Thermal Heating Flame Node (Chauffage Central & Chauffe-eau) */}
        <g id="thermal-flame" transform="translate(325, 110)">
          {/* Outer glow */}
          <circle cx="0" cy="0" r="24" fill="#f97316" opacity="0.25" filter="blur(6px)" />
          {/* Stylized Flame */}
          <path
            d="M 0 -26 C 8 -12 18 -2 18 10 C 18 20 10 28 0 28 C -10 28 -18 20 -18 10 C -18 -2 -8 -12 0 -26 Z"
            fill="url(#flame-core)"
            filter="drop-shadow(0 0 16px rgba(249,115,22,0.7))"
          />
          <path
            d="M 0 -12 C 4 -5 9 0 9 6 C 9 11 5 15 0 15 C -5 15 -9 11 -9 6 C -9 0 -4 -5 0 -12 Z"
            fill="#ffffff"
            opacity="0.85"
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
