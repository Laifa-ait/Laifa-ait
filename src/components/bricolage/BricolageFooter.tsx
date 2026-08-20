import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

export const BricolageFooter: React.FC = () => {
  const { tBricolage } = useBricolageI18n();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t-4 border-amber-500 py-12 px-4 sm:px-8 lg:px-12 text-xs">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-black text-base">
            <HardHat className="w-5 h-5 text-amber-400" />
            <span>OLMA BRICOLAGE</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            {tBricolage('header.brandSub', "Plateforme de mise en relation avec des artisans qualifiés et dépannage d'urgence en Algérie.")}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-sm">{tBricolage('footer.popularServices', 'Services Populaires')}</h4>
          <ul className="space-y-2 text-slate-400">
            <li>{tBricolage('categories.plumbing', 'Plomberie & Sanitaire')}</li>
            <li>{tBricolage('categories.hvac', 'Climatisation & Chauffage')}</li>
            <li>{tBricolage('categories.electricity', 'Électricité & Tableaux')}</li>
            <li>{tBricolage('categories.painting', 'Peinture & Rénovation')}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-sm">{tBricolage('footer.coverageWilayas', 'Couverture Wilayas')}</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Alger (16) & Blida (09)</li>
            <li>Oran (31) & Tlemcen (13)</li>
            <li>Constantine (25) & Sétif (19)</li>
            <li>Tizi Ouzou (15) & Béjaïa (06)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 text-sm">{tBricolage('footer.assistanceEmergency', 'Assistance & Urgence')}</h4>
          <div className="space-y-2">
            <p className="text-amber-400 font-black">{tBricolage('header.hotlineTel', 'Hotline SOS : 023 00 00 00')}</p>
            <p className="text-slate-400">Support Client : support@olmart.dz</p>
            <div className="pt-2">
              <Link to="/" className="text-amber-400 hover:underline font-bold flex items-center gap-1">
                <span>← {tBricolage('header.marketplaceReturn', 'Marketplace Olmart')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
        <p>© 2026 Olma Bricolage by Olmart. Tous droits réservés.</p>
      </div>
    </footer>
  );
};
