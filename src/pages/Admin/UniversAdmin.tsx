import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { OlmaAppModule, OlmaAppStatus } from '../../types/olmaUnivers';
import {
  fetchOlmaUniversApps,
  updateAdminOlmaApp,
  createAdminOlmaApp,
  deleteAdminOlmaApp,
  seedAdminOlmaApps
} from '../../services/olmaUnivers.api';
import { AppAdminCard } from '../../components/Admin/AppAdminCard';
import { AppModuleEditorModal } from '../../components/Admin/AppModuleEditorModal';
import { IconPickerModal } from '../../components/Admin/IconPickerModal';
import { UniversHeader } from '../../components/Admin/UniversHeader';

export function UniversAdmin(): React.ReactElement {
  const [apps, setApps] = useState<OlmaAppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<OlmaAppModule | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [quickIconApp, setQuickIconApp] = useState<OlmaAppModule | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchOlmaUniversApps();
    setApps(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (app: OlmaAppModule, newStatus: OlmaAppStatus) => {
    setSavingId(app.id);
    const updated = { ...app, status: newStatus };
    const res = await updateAdminOlmaApp(updated);
    if (res.success) {
      setApps((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
      setMsg(`Statut mis à jour pour "${app.title.fr}"`);
    } else {
      setMsg(`Erreur: ${res.message}`);
    }
    setSavingId(null);
  };

  const handleToggleHomeVisibility = async (app: OlmaAppModule) => {
    setSavingId(app.id);
    const updated = { ...app, showInHomeShortcuts: app.showInHomeShortcuts === false };
    const res = await updateAdminOlmaApp(updated);
    if (res.success) {
      setApps((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
      setMsg(`Visibilité accueil modifiée pour "${app.title.fr}"`);
    }
    setSavingId(null);
  };

  const handleSaveApp = async (appToSave: OlmaAppModule) => {
    const isNew = !apps.some((a) => a.id === appToSave.id);
    setLoading(true);
    if (isNew) {
      const res = await createAdminOlmaApp(appToSave);
      if (res.success) {
        setApps((prev) => [...prev, appToSave].sort((a, b) => (a.order || 0) - (b.order || 0)));
        setMsg(`Application "${appToSave.title.fr}" créée avec succès`);
      }
    } else {
      const res = await updateAdminOlmaApp(appToSave);
      if (res.success) {
        setApps((prev) =>
          prev
            .map((a) => (a.id === appToSave.id ? appToSave : a))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        setMsg(`Application "${appToSave.title.fr}" modifiée avec succès`);
      }
    }
    setLoading(false);
  };

  const handleDeleteApp = async (app: OlmaAppModule) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${app.title.fr}" ?`)) return;
    setSavingId(app.id);
    const res = await deleteAdminOlmaApp(app.id);
    if (res.success) {
      setApps((prev) => prev.filter((a) => a.id !== app.id));
      setMsg(`Application "${app.title.fr}" supprimée`);
    }
    setSavingId(null);
  };

  const handleSeed = async () => {
    setLoading(true);
    const res = await seedAdminOlmaApps();
    setMsg(res.message);
    await loadData();
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.title.fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.tags && app.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apps, searchQuery, statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <UniversHeader
        loading={loading}
        totalApps={apps.length}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onNewApp={() => {
          setEditingApp(null);
          setIsEditorOpen(true);
        }}
        onSeed={handleSeed}
        onRefresh={loadData}
      />

      {msg && (
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg('')}
            className="text-[11px] hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <AppAdminCard
            key={app.id}
            app={app}
            isSaving={savingId === app.id}
            onEdit={(a) => {
              setEditingApp(a);
              setIsEditorOpen(true);
            }}
            onQuickIconPicker={(a) => {
              setQuickIconApp(a);
              setIsIconPickerOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onToggleHomeVisibility={handleToggleHomeVisibility}
            onDelete={handleDeleteApp}
          />
        ))}
      </div>

      <AppModuleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingApp(null);
        }}
        app={editingApp}
        onSave={handleSaveApp}
      />

      {quickIconApp && (
        <IconPickerModal
          isOpen={isIconPickerOpen}
          onClose={() => {
            setIsIconPickerOpen(false);
            setQuickIconApp(null);
          }}
          currentIcon={quickIconApp.icon}
          currentGradient={quickIconApp.gradient}
          currentBadgeColor={quickIconApp.badgeColor}
          currentBadgeText={quickIconApp.badge?.fr || ''}
          appTitle={quickIconApp.title.fr}
          onApply={async ({ icon, gradient, badgeColor, badgeText }) => {
            const updated: OlmaAppModule = {
              ...quickIconApp,
              icon,
              gradient,
              badgeColor,
              badge: {
                ...quickIconApp.badge,
                fr: badgeText,
                ar: quickIconApp.badge?.ar || badgeText,
                en: quickIconApp.badge?.en || badgeText
              }
            };
            await handleSaveApp(updated);
          }}
        />
      )}
    </div>
  );
}
