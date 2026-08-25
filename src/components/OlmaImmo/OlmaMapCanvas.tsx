import React from 'react';

export const OlmaMapCanvas: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-[#e7dfcf] overflow-hidden pointer-events-none">
      {/* Mediterranean Sea Top Vector */}
      <div className="absolute top-0 left-0 right-0 h-[22%] bg-[#dbe8e6] border-b-2 border-[#b5cdc9]" />

      {/* Major Coastline Curve & Roads */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 140 Q 200 120, 350 135 T 600 130 T 850 145 T 1000 135 L 1000 600 L 0 600 Z"
          fill="#f1ebe0"
          stroke="#c7bead"
          strokeWidth="2"
        />
        <path d="M 120 180 Q 320 160, 520 170 T 880 185" fill="none" stroke="#ffffff" strokeWidth="6" />
        <path d="M 520 170 L 530 450" fill="none" stroke="#ffffff" strokeWidth="4" />
        <path d="M 220 175 L 210 380" fill="none" stroke="#ffffff" strokeWidth="4" />
      </svg>

      {/* Regional Landmarks Labels */}
      <div className="absolute top-[18%] left-[16%] text-[10px] font-bold text-slate-500">Oran</div>
      <div className="absolute top-[17%] left-[48%] text-[10px] font-bold text-slate-500">Alger</div>
      <div className="absolute top-[19%] left-[64%] text-[10px] font-bold text-slate-500">Béjaïa</div>
      <div className="absolute top-[23%] left-[78%] text-[10px] font-bold text-slate-500">Constantine</div>
      <div className="absolute top-[20%] left-[88%] text-[10px] font-bold text-slate-500">Annaba</div>
      <div className="absolute top-[8%] left-[50%] text-[11px] font-semibold text-[#6d9692] italic">
        Mer Méditerranée
      </div>
    </div>
  );
};
