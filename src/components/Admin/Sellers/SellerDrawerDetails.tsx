import { Shop } from "../../../domains/seller/shop.types";
import { UserProfile, AuthUser as FirebaseUser } from "../../../domains/user/user.types";
import React from "react";
import { Store, FileText, Landmark, Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { forceDownload } from "../../../utils/download";
import { normalizeTimestamp } from "../../../utils/date";
import toast from "react-hot-toast";
import { OptimizedImage } from "../../ui/OptimizedImage";



interface OcrResult {
  fullName?: string;
  documentNumber?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  [key: string]: string | undefined;
}
export const SellerDrawerDetails: React.FC<{
  selectedSeller: Shop;
  setPreviewDocUrl: (url: string | null) => void;
  currentUser: FirebaseUser | UserProfile | null;
  ocrLoading: boolean;
  setOcrLoading: (loading: boolean) => void;
  ocrResult: OcrResult | null;
  setOcrResult: (result: OcrResult | null) => void;
}> = ({
  selectedSeller,
  setPreviewDocUrl,
  currentUser,
  ocrLoading,
  setOcrLoading,
  ocrResult,
  setOcrResult,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 p-12 overflow-y-auto scrollbar-hide border-r border-zinc-100">
      <div className="flex items-center gap-8 mb-12">
        <div className="w-24 h-24 rounded-[2rem] bg-zinc-100 overflow-hidden shadow-2xl border-4 border-white">
          <OptimizedImage
            src={selectedSeller.logoUrl || `https://ui-avatars.com/api/?name=${selectedSeller.shopName || "S"}&background=random`}
            alt={selectedSeller.shopName || "Shop Logo"}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal mb-2">
            {selectedSeller.shopName}
          </h3>
          <p className="text-zinc-500 font-medium">
            {t("Inscrit le")}
            {selectedSeller.createdAt ? new Date(normalizeTimestamp(selectedSeller.createdAt).toDate()).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-orange-50/50 rounded-[2.5rem] p-10 border border-orange-100">
            <h4 className="text-[10px] font-sans font-bold text-orange-600 uppercase tracking-widest rtl:tracking-normal mb-6 flex items-center gap-2">
              <Store className="w-4 h-4" /> {t("Profil Artistique & Identité")}
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                    {t("Nom de la Marque")}
                  </span>
                  <span className="text-sm font-sans font-bold text-zinc-950">
                    {selectedSeller.shopName || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                    {t("Style de Design")}
                  </span>
                  <span className="inline-flex items-center self-start px-3 py-1 bg-white border border-orange-200 rounded-full text-[10px] font-bold text-orange-800 uppercase tracking-wider rtl:tracking-normal">
                    {selectedSeller.slogan || "Non spécifié"}
                  </span>
                </div>
              </div>
              {selectedSeller.description && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
                    {t("Histoire de la Marque")}
                  </span>
                  <p className="text-sm text-zinc-600 italic leading-relaxed whitespace-pre-wrap">
                    {selectedSeller.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-zinc-50 rounded-[2.5rem] p-10 border border-zinc-100">
            <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" /> {t("Documents Légaux")}
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">{t("RC N°")}</span>
                <span className="text-sm font-sans font-bold text-zinc-950">{selectedSeller.rcNumber || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">{t("NIF N°")}</span>
                <span className="text-sm font-sans font-bold text-zinc-950">{selectedSeller.nifNumber || "N/A"}</span>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                {selectedSeller.documents?.rcDocument && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPreviewDocUrl(selectedSeller.documents!.rcDocument!)}
                      className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-3 text-zinc-600 font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:text-zinc-950 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> {t("Aperçu Registre de Commerce (RC)")}
                    </button>
                    <button
                      onClick={() =>
                        forceDownload(
                          selectedSeller.documents!.rcDocument!,
                          `RC_${selectedSeller.shopName}.jpg`
                        )
                      }
                      className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {selectedSeller.documents?.idDocument && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setPreviewDocUrl(selectedSeller.documents!.idDocument!)}
                        className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-3 text-zinc-600 font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:text-zinc-950 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> {t("Aperçu Pièce d'Identité")}
                      </button>
                      <button
                        onClick={() =>
                          forceDownload(
                            selectedSeller.documents!.idDocument! as string,
                            `ID_${selectedSeller.shopName}.jpg`
                          )
                        }
                        className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          setOcrLoading(true);
                          try {
                            const user = currentUser as { getIdToken?: (force?: boolean) => Promise<string> } | null;
                            const token = user?.getIdToken ? await user.getIdToken() : "";
                            const res = await fetch(`/api/v1/admin/sellers/${selectedSeller.id}/ocr`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ documentUrl: selectedSeller.documents!.idDocument! }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "Erreur OCR");
                            setOcrResult(data.result);
                            toast.success(t("Analyse OCR terminée"));
                          } catch {
                            toast.error(t("Échec de l'analyse OCR"));
                          } finally {
                            setOcrLoading(false);
                          }
                        }}
                        disabled={ocrLoading}
                        className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-colors disabled:opacity-50 ml-auto"
                      >
                        {ocrLoading ? "Analyse..." : "Analyse IA (OCR)"}
                      </button>
                    </div>
                    {ocrResult && (
                      <div className="mt-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                        <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">
                          {t("Résultats de l'analyse OCR")}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-zinc-500">Nom complet:</span>{" "}
                            <span className="font-bold">{ocrResult.fullName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">N° Document:</span>{" "}
                            <span className="font-bold">{ocrResult.documentNumber}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Date Naissance:</span>{" "}
                            <span className="font-bold">{ocrResult.dateOfBirth}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Date Expiration:</span>{" "}
                            <span className="font-bold">{ocrResult.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedSeller.documents?.ribDocument && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPreviewDocUrl(selectedSeller.documents!.ribDocument!)}
                      className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-3 text-zinc-600 font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:text-zinc-950 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> {t("Aperçu Attestation RIB")}
                    </button>
                    <button
                      onClick={() =>
                        forceDownload(
                          selectedSeller.documents!.ribDocument!,
                          `RIB_${selectedSeller.shopName}.jpg`
                        )
                      }
                      className="bg-transparent border-none p-0 cursor-pointer flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-zinc-950 rounded-[2.5rem] p-10 text-white border border-white/10 shadow-2xl">
            <h4 className="text-[10px] font-sans font-bold text-white uppercase tracking-widest rtl:tracking-normal mb-6 flex items-center gap-2">
              <Landmark className="w-4 h-4" /> {t("Coordonnées Bancaires")}
            </h4>
            <div className="space-y-4">
              <p className="text-[10px] font-sans font-bold text-white uppercase tracking-widest rtl:tracking-normal">
                {t("RIB / RIP ALGÉRIE")}
              </p>
              <p className="text-2xl font-sans font-bold text-white tracking-tighter rtl:tracking-normal break-all">
                {selectedSeller.rib || "NON FOURNI"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
