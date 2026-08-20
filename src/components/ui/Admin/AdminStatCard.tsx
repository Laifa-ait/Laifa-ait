import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
  iconBgClass?: string;
  delay?: number;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = "text-orange-600",
  iconBgClass = "bg-orange-50",
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group hover:border-zinc-200 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${iconBgClass} mb-4 transition-transform group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
            {trendLabel && <span className="ml-1 opacity-70">{trendLabel}</span>}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-sans font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};
