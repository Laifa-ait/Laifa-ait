import React from 'react';
import { Tag, CheckCircle2 } from 'lucide-react';

const PRICE_ITEMS = [
  { service: "Recharge Gaz Climatiseur R410a / R32", avgPrice: "4 500 - 7 000 DA", time: "1h00", guarantee: "Garantie 6 mois" },
  { service: "Déplacement & Diagnostic Plomberie", avgPrice: "1 500 - 3 000 DA", time: "30 min", guarantee: "Inclus si intervention validée" },
  { service: "Changement de Chauffe-eau / Chaudière", avgPrice: "6 000 - 12 000 DA", time: "2h - 4h", guarantee: "Garantie Pose Olma" },
  { service: "Recherche de Fuite d'Eau Infiltrée", avgPrice: "3 500 - 8 000 DA", time: "1h30", guarantee: "Matériel Thermique" },
  { service: "Pose Faux Plafond BA13 avec Spots (m²)", avgPrice: "1 200 - 2 500 DA / m²", time: "Selon Surface", guarantee: "Finition Lisse" },
  { service: "Dépannage Court-Circuit & Tableau Électrique", avgPrice: "3 000 - 9 000 DA", time: "1h00", guarantee: "Conforme Normes" }
];

export const BricolagePriceGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-400/20 px-2.5 py-1 rounded border border-amber-300">
            Guide Référentiel
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Barème des Tarifs Moyens Constatés en Algérie
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-semibold max-w-sm">
          Transparence totale : des tarifs de marché régulièrement réévalués pour vous éviter les surfacturations.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Prestation / Intervention</th>
              <th className="py-3.5 px-4">Fourchette Moyenne DZD</th>
              <th className="py-3.5 px-4">Durée Estimée</th>
              <th className="py-3.5 px-4">Garantie Olma Safe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {PRICE_ITEMS.map((item, idx) => (
              <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{item.service}</span>
                </td>
                <td className="py-3.5 px-4 font-black text-slate-900">{item.avgPrice}</td>
                <td className="py-3.5 px-4 text-slate-600 font-bold">{item.time}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.guarantee}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
