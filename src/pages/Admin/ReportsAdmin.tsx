import React, { useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { apiGet } from '../../lib/api';
import { exportToCSVNative } from '../../utils/csvExport';

export const ReportsAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const [generating, setGenerating] = useState<string | null>(null);

  const downloadReport = async (type: string) => {
    setGenerating(type);
    const toastId = toast.loading(
      isArabic 
        ? `جاري إنشاء وجمع بيانات ${type}...` 
        : `Génération et extraction des données pour ${type}...`
    );

    try {
      const res = await apiGet<{ success: boolean; headers: string[]; rows: (string | number)[][]; filename: string; error?: string }>(`/api/v1/admin/reports/export?type=${encodeURIComponent(type)}`);
      if (res && res.success) {
        exportToCSVNative(res.headers, res.rows, res.filename);
        toast.success(
          isArabic 
            ? `تم تصدير ملف '${type}' بنجاح !` 
            : `Rapport "${type}" exporté avec succès !`,
          { id: toastId }
        );
      } else {
        throw new Error(res.error || "Erreur lors de la génération du rapport");
      }
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Erreur serveur";
      toast.error(
        isArabic 
          ? `حدث خطأ أثناء تصدير التقرير: ${msg}` 
          : `Erreur lors de l'exportation : ${msg}`,
        { id: toastId }
      );
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-2">
        <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950 uppercase">{t("Exports & Rapports")}</h2>
        <p className="text-zinc-500 font-medium">{t("Générez des rapports CSV/Excel pour la comptabilité, le marketing et l'analytique globale.")}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Rapport Financier", desc: "Toutes les transactions, commissions et payouts", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Export Commandes", desc: "Liste détaillée des commandes avec statuts", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Performance Vendeurs", desc: "Notes, volume de vente par boutique", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((report, idx) => {
          const isThisLoading = generating === report.title;
          
          return (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col items-start gap-4 hover:border-zinc-200 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg} ${report.color}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="min-h-[72px]">
                <h3 className="font-sans font-bold text-lg text-zinc-900">{t(report.title)}</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">{t(report.desc)}</p>
              </div>
              <button 
                onClick={() => downloadReport(report.title)} 
                disabled={generating !== null}
                className="mt-4 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-700 rounded-xl font-bold uppercase tracking-widest rtl:tracking-normal text-[10px] flex items-center gap-2 w-full justify-center transition-colors"
                id={`btn-report-${idx}`}
              >
                {isThisLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isThisLoading ? t("Génération...") : t("Générer Excel")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
