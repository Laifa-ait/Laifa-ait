import React, { useEffect, useState, useCallback } from "react";
import { FileText, Download, Trash2, HardDrive, RefreshCw, AlertCircle, Eye, FolderLock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataConsent } from "../../context/DataConsentContext";
import { fetchMyDocuments, deleteUserDocument } from "../../services/documents.service";
import { formatBytes } from "../../utils/userStorageManager";
import { DocumentCategory, UserDocumentDTO } from "../../types/documents";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identity: "Pièce d'identité",
  real_estate_legal: "Immobilier (Actes & Livret)",
  artisan_qualification: "Agrément Artisan",
  seller_registry: "Registre du Commerce",
  invoice: "Facture & Paiement",
  dispute_evidence: "Preuve de litige",
  general: "Document général",
};

interface UserDocumentsVaultProps {
  initialCategory?: DocumentCategory | "all";
  onSelectDocument?: (doc: UserDocumentDTO) => void;
}

export const UserDocumentsVault: React.FC<UserDocumentsVaultProps> = ({
  initialCategory,
  onSelectDocument,
}) => {
  const { currentUser } = useAuth();
  const { preferences, storageUsage, refreshStorageUsage, clearBrowserCache, openConsentModal } = useDataConsent();
  const [documents, setDocuments] = useState<UserDocumentDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">(initialCategory || "all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const cat = selectedCategory === "all" ? undefined : selectedCategory;
      const docs = await fetchMyDocuments(cat);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedCategory]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) return;
    setDeletingId(docId);
    try {
      await deleteUserDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      refreshStorageUsage();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible de supprimer");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePurgeMemory = () => {
    if (window.confirm("Voulez-vous vider le cache local pour libérer de la mémoire sur votre appareil ?")) {
      const { clearedBytes } = clearBrowserCache();
      alert(`Cache vidé avec succès (${formatBytes(clearedBytes)} libérés).`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage & Memory Monitor Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Mémoire & Coffre-fort Documentaire</h3>
              <p className="text-xs text-slate-300">
                Statut : {preferences.documentMemory ? "Mémoire autorisée" : "Mémoire restreinte"} • {documents.length} document(s) sécurisé(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openConsentModal}
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition"
            >
              Gérer autorisations
            </button>
            <button
              onClick={handlePurgeMemory}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition"
            >
              Vider le cache local
            </button>
          </div>
        </div>

        {storageUsage && (
          <div className="mt-4 pt-4 border-t border-slate-700/60">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
              <span>Utilisation du stockage appareil : {storageUsage.humanUsage}</span>
              <span>Quota alloué : {storageUsage.humanQuota} ({storageUsage.percentUsed}%)</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, storageUsage.percentUsed)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Tous les documents ({documents.length})
        </button>
        {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-xs font-bold">Chargement de votre coffre-fort...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <FolderLock className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-sm text-slate-800">Aucun document dans cette catégorie</p>
          <p className="text-xs text-slate-400">
            Utilisez le formulaire de téléversement ci-dessus pour ajouter vos justificatifs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-slate-900 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {CATEGORY_LABELS[doc.category] || doc.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Ajouté le {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {onSelectDocument && (
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Sélectionner ce document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
