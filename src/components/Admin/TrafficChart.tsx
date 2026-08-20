import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface TrafficChartProps {
  data: unknown[];
  t: (key: string) => string;
}

export default function TrafficChart({ data, t }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCarts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f4f4f5" strokeDasharray="5 5" vertical={false} />
        <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
        <RechartsTooltip
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#18181b', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="views" name={t("Vues Produits")} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
        <Area type="monotone" dataKey="carts" name={t("Ajouts au Panier")} stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorCarts)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
