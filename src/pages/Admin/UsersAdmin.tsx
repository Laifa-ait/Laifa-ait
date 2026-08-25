import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/api";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminStatCard } from "../../components/ui/Admin/AdminStatCard";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { StatusBadge } from "../../components/ui/Admin/StatusBadge";
import {
  Users,
  Search,
  Shield,
  Building2,
  Star,
  CheckCircle2,
  PowerOff,
  ChevronDown,
  Download,
  Filter,
  Monitor,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../../hooks/useConfirm";
import { ALGERIA_WILAYAS } from "../../constants";
import { IpLogsModal } from "../../components/Admin/IpLogsModal";

interface AdminUser {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  clientType?: string;
  orderCount?: number;
  status?: string;
  wilaya?: string;
  createdAt?: {
    toDate?: () => Date;
    toMillis?: () => number;
  } | string | number;
  [key: string]: unknown;
}

export const UsersAdmin: React.FC = () => {
    const { t } = useTranslation();
    const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
    
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("createdAt_desc");
  const [ipLogsUser, setIpLogsUser] = useState<AdminUser | null>(null);
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map((u: AdminUser) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkStatusUpdate = async (newStatus: "active" | "suspended") => {
    if (selectedUserIds.length === 0) return;
    setBulkLoading(true);
    try {
      await apiPost("/api/v1/admin/users/bulk-status", {
        userIds: selectedUserIds,
        status: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: newStatus } : u))
      );
      setSelectedUserIds([]);
      toast.success(
        newStatus === "active"
          ? t("Utilisateurs activés avec succès")
          : t("Utilisateurs suspendus avec succès")
      );
    } catch (err: unknown) {
      console.error("[UsersAdmin] Error performing bulk status update:", err);
      toast.error(t("Erreur lors de la mise à jour en lot"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(t("Êtes-vous sûr de vouloir supprimer définitivement les utilisateurs sélectionnés ?"))) {
      return;
    }
    setBulkLoading(true);
    try {
      await apiPost("/api/v1/admin/users/bulk-delete", {
        userIds: selectedUserIds,
      });

      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
      toast.success(t("Utilisateurs supprimés avec succès"));
    } catch (err: unknown) {
      console.error("[UsersAdmin] Error performing bulk delete:", err);
      toast.error(err instanceof Error ? err.message : t("Erreur lors de la suppression en lot"));
    } finally {
      setBulkLoading(false);
    }
  };

  const fetchUsers = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const queryParams = new URLSearchParams();
      if (roleFilter !== "all") queryParams.append("role", roleFilter);
      queryParams.append("limit", "50");

      if (isLoadMore && lastVisible) {
        queryParams.append("lastDocId", lastVisible);
      }

      const res = await apiGet<{
        success?: boolean;
        users?: AdminUser[];
        lastVisibleId?: string;
        hasMore?: boolean;
      }>(`/api/v1/admin/users?${queryParams.toString()}`);
      if (res && res.success) {
        const fetchedUsers = res.users || [];
        if (isLoadMore) {
          setUsers((prev) => [...prev, ...fetchedUsers]);
        } else {
          setUsers(fetchedUsers);
        }
        setLastVisible(res.lastVisibleId || null);
        setHasMore(!!res.hasMore);
      }
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roleFilter, lastVisible]);

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  const handleUpdateClientType = async (userId: string, newType: string) => {
    try {
      await apiPut(`/api/v1/admin/users/${userId}/client-type`, {
        clientType: newType,
      });
      toast.success("Type de client mis à jour");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, clientType: newType } : u)),
      );
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleDeactivate = async (user: AdminUser) => {
      const isCurrentlyInactive = user.status === "inactive";
      const actionTxt = isCurrentlyInactive ? "réactiver" : "désactiver";
      const confirmed = await showConfirmModal(`Voulez-vous vraiment ${actionTxt} le compte de ${user.displayName || user.email} ?`);
      if (!confirmed) return;
      try {
          const newStatus = isCurrentlyInactive ? "active" : "inactive";
          await apiPut(`/api/v1/admin/users/${user.id}/status`, { status: newStatus });
          toast.success(`Compte ${actionTxt} avec succès`);
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Erreur lors de l'opération");
      }
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Nom", "Email", "Role", "Type Client", "Commandes", "Statut", "Date Creation"],
      ...users.map(u => [
        u.id,
        u.displayName || "",
        u.email || "",
        u.role || "buyer",
        u.clientType || "standard",
        u.orderCount || 0,
        u.status || "active",
        u.createdAt ? (typeof u.createdAt === 'object' && 'toDate' in u.createdAt && typeof u.createdAt.toDate === 'function' ? u.createdAt.toDate().toLocaleDateString() : String(u.createdAt)) : ""
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `olmart_users_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export CSV réussi");
  };

  let filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (wilayaFilter !== "all") {
     filteredUsers = filteredUsers.filter(u => u.wilaya === wilayaFilter);
  }

  if (dateFilter !== "all") {
     const now = new Date();
     let days = 0;
     if (dateFilter === "7days") days = 7;
     if (dateFilter === "30days") days = 30;
     if (dateFilter === "90days") days = 90;
     const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
     filteredUsers = filteredUsers.filter(u => {
        const createdAt = (typeof u.createdAt === 'object' && u.createdAt && 'toDate' in u.createdAt && typeof u.createdAt.toDate === 'function')
          ? u.createdAt.toDate()
          : new Date(u.createdAt as string | number || 0);
        return createdAt >= cutoff;
     });
  }

  filteredUsers.sort((a, b) => {
     if (sortByFilter === "createdAt_desc") {
        const dA = (typeof a.createdAt === 'object' && a.createdAt && 'toMillis' in a.createdAt && typeof a.createdAt.toMillis === 'function')
          ? a.createdAt.toMillis()
          : (typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt as string || 0).getTime());
        const dB = (typeof b.createdAt === 'object' && b.createdAt && 'toMillis' in b.createdAt && typeof b.createdAt.toMillis === 'function')
          ? b.createdAt.toMillis()
          : (typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt as string || 0).getTime());
        return dB - dA;
     }
     if (sortByFilter === "createdAt_asc") {
        const dA = (typeof a.createdAt === 'object' && a.createdAt && 'toMillis' in a.createdAt && typeof a.createdAt.toMillis === 'function')
          ? a.createdAt.toMillis()
          : (typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt as string || 0).getTime());
        const dB = (typeof b.createdAt === 'object' && b.createdAt && 'toMillis' in b.createdAt && typeof b.createdAt.toMillis === 'function')
          ? b.createdAt.toMillis()
          : (typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt as string || 0).getTime());
        return dA - dB;
     }
     if (sortByFilter === "orders_desc") {
        return (b.orderCount || 0) - (a.orderCount || 0);
     }
     if (sortByFilter === "orders_asc") {
        return (a.orderCount || 0) - (b.orderCount || 0);
     }
     return 0;
  });

  const columns = [
    {
      header: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAllUsers(selectedUserIds.length !== filteredUsers.length && filteredUsers.length > 0);
          }}
          className="text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length ? (
            <CheckSquare className="w-5 h-5 text-indigo-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      ),
      accessor: (user: AdminUser) => {
        const isSelected = selectedUserIds.includes(user.id);
        return (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleSelectUser(user.id, !isSelected)}
              className="text-zinc-400 hover:text-indigo-600 transition-colors inline-block cursor-pointer bg-transparent border-none p-0"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-indigo-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      },
      className: "w-12 text-center"
    },
    {
      header: t("Utilisateur"),
      accessor: (user: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-sans font-bold uppercase shadow-inner">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
          </div>
          <div>
              <span className="font-bold text-zinc-900 block">
                {user.displayName || "Sans nom"}
              </span>
              {user.status === "inactive" && <span className="text-[9px] font-bold text-red-500 uppercase">Désactivé</span>}
          </div>
        </div>
      )
    },
    {
      header: t("Email"),
      accessor: (user: AdminUser) => (
        <span className="text-sm text-zinc-500 font-medium">{user.email}</span>
      )
    },
    {
      header: t("Rôle"),
      accessor: (user: AdminUser) => (
        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal rounded-lg border border-zinc-200">
          {user.role || "buyer"}
        </span>
      )
    },
    {
      header: t("Commandes"),
      accessor: (user: AdminUser) => (
        <span className="inline-flex items-center justify-center min-w-[2rem] h-8 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold px-2">
           {user.orderCount || 0}
        </span>
      ),
      className: "text-center"
    },
    {
      header: t("Privilège (Type)"),
      accessor: (user: AdminUser) => (
        <div className="relative inline-block w-40">
          <select
            value={user.clientType || "standard"}
            onChange={(e) => handleUpdateClientType(user.id, e.target.value)}
            className={`w-full appearance-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal rounded-xl border-2 transition-colors cursor-pointer outline-none ${
              user.clientType === "vip"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : user.clientType === "architect"
                  ? "bg-purple-50 border-purple-200 text-purple-800"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
            }`}
          >
            <option value="standard">{t("Standard")}</option>
            <option value="vip">{t("Client VIP")}</option>
            <option value="architect">{t("Architecte")}</option>
          </select>
          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {user.clientType === "vip" && (
              <Star className="w-3 h-3 text-amber-500" />
            )}
            {user.clientType === "architect" && (
              <Building2 className="w-3 h-3 text-purple-500" />
            )}
            {(!user.clientType ||
              user.clientType === "standard") && (
              <CheckCircle2 className="w-3 h-3 text-zinc-400" />
            )}
          </div>
        </div>
      )
    },
    {
      header: t("Actions"),
      accessor: (user: AdminUser) => (
        <div className="flex items-center justify-end gap-2">
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIpLogsUser(user);
                }}
                title={t("Voir l'historique IP")}
                className="p-2 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(user);
              }}
              title={user.status === "inactive" ? "Réactiver le compte" : "Désactiver le compte"}
              className={`p-2 rounded-xl transition-colors ${user.status === "inactive" ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
               <PowerOff className="w-4 h-4" />
            </button>
        </div>
      ),
      className: "text-end"
    }
  ];

  return (
    <div className="space-y-8">
      <ConfirmationDialog />
      {/* Header */}
      <AdminPageHeader 
        title={t("Gestion des Utilisateurs")} 
        subtitle={t("Gérez les comptes, privilèges VIP, et accès à la plateforme.")}
        actions={
           <AdminStatCard 
             title={t("Utilisateurs chargés")}
             value={`${users.length} ${hasMore ? "+" : ""}`}
             icon={Users}
             colorClass="text-indigo-600"
             iconBgClass="bg-indigo-50"
           />
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:w-96 shrink-0">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={t("Rechercher (email, nom)...") || "Rechercher (email, nom)..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-12 pe-4 py-4 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 ring-indigo-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[140px]">
             <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none px-4 py-4 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-700 outline-none cursor-pointer focus:ring-2 ring-indigo-500/20"
             >
                <option value="all">{t("Tous rôles")}</option>
                <option value="buyer">{t("Clients")}</option>
                <option value="seller">{t("Vendeurs")}</option>
                <option value="admin">{t("Admins")}</option>
             </select>
             <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-[140px]">
             <select 
                value={wilayaFilter} 
                onChange={(e) => setWilayaFilter(e.target.value)}
                className="w-full appearance-none px-4 py-4 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-700 outline-none cursor-pointer focus:ring-2 ring-indigo-500/20"
             >
                <option value="all">{t("Toutes wilayas")}</option>
                {ALGERIA_WILAYAS.map(w => (
                   <option key={w as string} value={w as string}>{w as string}</option>
                ))}
             </select>
             <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-[140px]">
             <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full appearance-none px-4 py-4 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-700 outline-none cursor-pointer focus:ring-2 ring-indigo-500/20"
             >
                <option value="all">{t("Toutes dates")}</option>
                <option value="7days">{t("7 derniers jours")}</option>
                <option value="30days">{t("30 derniers jours")}</option>
                <option value="90days">{t("90 derniers jours")}</option>
             </select>
             <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-[140px]">
             <select 
                value={sortByFilter} 
                onChange={(e) => setSortByFilter(e.target.value)}
                className="w-full appearance-none px-4 py-4 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-700 outline-none cursor-pointer focus:ring-2 ring-indigo-500/20"
             >
                <option value="createdAt_desc">{t("Plus récents")}</option>
                <option value="createdAt_asc">{t("Plus anciens")}</option>
                <option value="orders_desc">{t("Commandes (Décroissant)")}</option>
                <option value="orders_asc">{t("Commandes (Croissant)")}</option>
             </select>
             <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <button 
            onClick={exportCSV}
            className="flex-1 min-w-[140px] px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold uppercase tracking-widest rtl:tracking-normal text-[10px] hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-100"
          >
            <Download className="w-4 h-4" /> {t("Exporter")}
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable 
        data={filteredUsers}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={loading}
        emptyState={
          <div className="text-zinc-500 font-medium">
            {t("Aucun utilisateur trouvé.")}
          </div>
        }
      />
      
      {!loading && hasMore && filteredUsers.length > 0 && (
         <div className="p-6 flex justify-center">
             <button 
               onClick={() => fetchUsers(true)}
               disabled={loadingMore}
               className="px-8 py-3 bg-white border border-zinc-200 text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50"
             >
                 {loadingMore ? t("Chargement...") : t("Charger plus d'utilisateurs")}
             </button>
         </div>
      )}

      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 bg-zinc-950 text-white p-4 sm:p-5 rounded-[2.5rem] shadow-2xl z-55 w-[90%] max-w-xl flex items-center justify-between gap-4 border border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-sans font-bold text-sm text-white">
              {selectedUserIds.length}
            </span>
            <div>
              <strong className="text-xs uppercase tracking-wider block font-sans font-bold text-white">
                {t("Utilisateurs sélectionnés")}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatusUpdate("active")}
              disabled={bulkLoading}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
              title={t("Activer la sélection")}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("Activer")}</span>
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("suspended")}
              disabled={bulkLoading}
              className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
              title={t("Bloquer la sélection")}
            >
              <UserX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("Bloquer")}</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md disabled:opacity-50"
              title={t("Supprimer la sélection")}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("Supprimer")}</span>
            </button>
            <button
              onClick={() => {
                const selectedList = users.filter(u => selectedUserIds.includes(u.id));
                const headers = ["ID", "Name", "Email", "Role", "ClientType", "OrdersCount", "Status"];
                const rows = selectedList.map(u => [u.id, u.displayName||"", u.email||"", u.role||"buyer", u.clientType||"standard", u.orderCount||0, u.status||"active"]);
                const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_selected_${selectedUserIds.length}.csv`;
                a.click();
                toast.success(t("Exportation réussie"));
              }}
              className="py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer border-none transition-all shadow-md"
              title={t("Exporter la sélection")}
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">{t("Exporter")}</span>
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all"
            >
              {t("X")}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
         {ipLogsUser && (
            <IpLogsModal user={ipLogsUser} onClose={() => setIpLogsUser(null)} />
         )}
      </AnimatePresence>
    </div>
  );
};
