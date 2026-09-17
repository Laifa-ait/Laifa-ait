import React, { useState } from "react";
import { FolderLock, Shield } from "lucide-react";
import { UniversalFileUploader } from "../Documents/UniversalFileUploader";
import { UserDocumentsVault } from "../Documents/UserDocumentsVault";
import { DocumentCategory, UserDocumentDTO } from "../../types/documents";

export const UserDocumentsSection: React.FC = () => {
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>("general");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (_doc: UserDocumentDTO) => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mes Documents & Mémoire de données
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gérez vos documents officiels, vos actes légaux et l'autorisation d'utilisation de la mémoire.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <Shield className="w-4 h-4" />
          <span>Protection Chiffrée & IDOR</span>
        </div>
      </header>

      {/* Upload Box */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Type de document à téléverser :</label>
          <select
            value={selectedUploadCategory}
            onChange={(e) => setSelectedUploadCategory(e.target.value as DocumentCategory)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"
          >
            <option value="general">Général / Divers</option>
            <option value="identity">Pièce d'identité (CNI / Passeport)</option>
            <option value="real_estate_legal">Immobilier (Acte, Livret, Permis)</option>
            <option value="artisan_qualification">Agrément / Carte d'artisan</option>
            <option value="seller_registry">Registre du Commerce (CNRC)</option>
            <option value="invoice">Facture ou Justificatif de Paiement</option>
            <option value="dispute_evidence">Preuve de Réclamation / Litige</option>
          </select>
        </div>

        <UniversalFileUploader
          category={selectedUploadCategory}
          title="Ajouter un document à mon coffre-fort"
          description="Glissez votre justificatif ou cliquez pour parcourir vos fichiers"
          onUploadSuccess={handleUploadSuccess}
        />
      </div>

      {/* Vault List */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="flex items-center gap-2 mb-4">
          <FolderLock className="w-5 h-5 text-slate-800" />
          <h3 className="font-extrabold text-slate-900 text-lg">Documents Enregistrés</h3>
        </div>
        <UserDocumentsVault key={refreshKey} initialCategory="all" />
      </div>
    </div>
  );
};
