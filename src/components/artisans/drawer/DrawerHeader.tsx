import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, LogIn, ShieldCheck, Wrench, UserCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ArtisanProfile } from '../../../types/artisan';

interface DrawerHeaderProps {
  onClose: () => void;
  artisanProfile: ArtisanProfile | null;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  onClose,
  artisanProfile,
}) => {
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isArtisan = artisanProfile?.status === 'approved';

  return (
    <div className="p-5 bg-[#0F172A] text-white shrink-0 border-b border-slate-800">
      {/* Brand Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
            OL
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-white uppercase font-sans">
                Olma Artisans
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                DZ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Travaux & Dépannage • 58 Wilayas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User Account Info */}
      {currentUser ? (
        <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white truncate">
                  {user?.displayName || 'Client Olmart'}
                </p>
                {isAdmin ? (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 text-[9px] font-black border border-purple-500/40 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Admin
                  </span>
                ) : isArtisan ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black border border-amber-500/30 flex items-center gap-0.5">
                    <Wrench className="w-2.5 h-2.5" />
                    Pro
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                    Client Vérifié
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/profile');
              }}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <UserCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Gérer mon profil & adresses</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <User className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Espace Utilisateur</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Connectez-vous pour suivre vos demandes de devis et enregistrer vos artisans favoris.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/auth?redirect=/artisans');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-950" />
            <span>Se connecter / S&apos;inscrire</span>
          </button>
        </div>
      )}
    </div>
  );
};
