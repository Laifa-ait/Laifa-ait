import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Wrench,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';

interface DrawerAdminSectionProps {
  isAdmin: boolean;
  onClose: () => void;
}

export const DrawerAdminSection: React.FC<DrawerAdminSectionProps> = ({
  isAdmin,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-600 text-white rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
              Espace Organisation & Admin
            </h4>
            <p className="text-[10px] text-purple-700 font-medium">
              Contrôle d&apos;accès et modération de l&apos;application
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black uppercase">
          Admin
        </span>
      </div>

      <div className="space-y-1.5">
        <button
          onClick={() => {
            onClose();
            navigate('/dashboard/admin/artisans');
          }}
          className="w-full p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-xs"
        >
          <span className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-300" />
            <span>Organisation Artisans & Services</span>
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/dashboard/admin');
          }}
          className="w-full p-2 rounded-xl bg-white hover:bg-purple-100/60 text-purple-900 text-xs font-semibold flex items-center justify-between border border-purple-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
            <span>Dashboard Principal Olmart</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>
    </div>
  );
};
