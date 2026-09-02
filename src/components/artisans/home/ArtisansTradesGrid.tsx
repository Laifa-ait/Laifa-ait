import React from 'react';
import { ArtisanTrade } from '../../../types/artisan';
import { ArtisanTradeCard } from '../ArtisanTradeCard';

interface ArtisansTradesGridProps {
  trades: ArtisanTrade[];
  selectedTradeId?: string;
  onSelectTrade: (tradeId: string) => void;
}

export const ArtisansTradesGrid: React.FC<ArtisansTradesGridProps> = ({
  trades,
  selectedTradeId,
  onSelectTrade,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Métiers & Corps d'État
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Sélectionnez une catégorie pour filtrer les artisans spécialisés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {trades.map((trade) => (
          <ArtisanTradeCard
            key={trade.id}
            trade={trade}
            isSelected={selectedTradeId === trade.id}
            onSelect={() => onSelectTrade(trade.id)}
          />
        ))}
      </div>
    </section>
  );
};
