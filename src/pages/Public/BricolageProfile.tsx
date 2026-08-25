import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wrench, FileText, Settings, HardHat } from 'lucide-react';
import { BricolageHeader } from '../../components/bricolage/BricolageHeader';
import { BricolageFooter } from '../../components/bricolage/BricolageFooter';

export const BricolageProfile: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/bricolage');
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  if (!currentUser) {
    navigate('/auth?redirect=/bricolage/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <BricolageHeader />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold text-2xl uppercase">
              {userProfile?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{userProfile?.displayName || 'Client Bricolage'}</h1>
              <p className="text-slate-500 text-sm">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu latéral Bricolage */}
          <div className="col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 text-amber-900 font-bold border border-amber-100 transition-colors cursor-pointer">
              <FileText className="w-5 h-5 text-amber-600" />
              Mes Devis
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-100 transition-colors cursor-pointer">
              <Wrench className="w-5 h-5 text-slate-400" />
              Interventions en cours
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-100 transition-colors cursor-pointer">
              <Settings className="w-5 h-5 text-slate-400" />
              Paramètres du compte
            </button>
            <button
              onClick={handleLogout}
              className="md:hidden w-full flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-red-50 text-red-600 font-medium border border-slate-100 transition-colors mt-8 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>

          {/* Contenu principal */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
              <HardHat className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune demande de devis</h3>
              <p className="text-slate-500 max-w-sm">
                Vous n'avez pas encore sollicité d'artisans. Trouvez le bon pro pour vos travaux dès aujourd'hui.
              </p>
              <button
                onClick={() => navigate('/bricolage')}
                className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Trouver un artisan
              </button>
            </div>
          </div>
        </div>
      </main>

      <BricolageFooter />
    </div>
  );
};
