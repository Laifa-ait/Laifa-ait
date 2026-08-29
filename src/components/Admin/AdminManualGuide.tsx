import React, { useState } from "react";
import { BookOpen, ChevronUp, ChevronDown, Download, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { getGuideSections } from "./adminManualData";

const exportManualToPDF = async (t: TFunction) => {
  const element = document.getElementById("olmart-printable-manual");
  if (!element) {
    toast.error(t("Erreur : Le document de base est introuvable."));
    return;
  }

  const toastId = toast.loading(t("Génération du manuel PDF officiel..."));

  try {
    // Save original styles/classes
    const originalStyle = element.getAttribute("style") || "";
    element.classList.remove("hidden");
    element.setAttribute(
      "style",
      "position: absolute; top: -10000px; left: -10000px; width: 800px; display: block; background: #ffffff; color: #000000;"
    );

    // Wait for the browser to compute the layout
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution crispness
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Restore original display state
    element.classList.add("hidden");
    if (originalStyle) {
      element.setAttribute("style", originalStyle);
    } else {
      element.removeAttribute("style");
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    // A4 Portrait standard proportions: 210mm x 297mm
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    let pageCount = 0;
    const MAX_PDF_PAGES = 30; // Strict boundary to prevent runaway loops

    while (heightLeft >= 0 && pageCount < MAX_PDF_PAGES) {
      pageCount++;
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Manuel_Gestion_OLMART.pdf");
    toast.success(t("Manuel exporté en PDF avec succès !"), { id: toastId });
  } catch (err) {
    console.error("Failed to generate PDF via html2canvas:", err);
    toast.error(t("Échec du PDF. Lancement de l'impression classique..."), { id: toastId });
    window.print();
  }
};

export const AdminManualGuide: React.FC = () => {
  const { t } = useTranslation();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const sections = getGuideSections(t);

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-zinc-950 tracking-tight rtl:tracking-normal">
              {t("📖 Manuel de Gestion & Guide d'Utilisation OLMART")}
            </h3>
            <p className="text-zinc-500 text-xs font-semibold">
              {t("Le document technique complet pour piloter et comprendre l'intégralité du site OLMART.")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal transition-all cursor-pointer border-none"
          >
            {isGuideOpen ? (
              <>
                {t("Masquer le manuel")}
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                {t("Lire en ligne")}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            onClick={() => exportManualToPDF(t)}
            className="flex items-center gap-2 px-5 py-3 bg-[#ea580c] hover:bg-orange-600 text-white rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal transition-all cursor-pointer shadow-md shadow-orange-500/10 border-none"
          >
            <Download className="w-4 h-4" /> {t("Exporter PDF officiel")}
          </button>
        </div>
      </div>

      {isGuideOpen && (
        <div className="mt-8 border-t border-zinc-100 pt-8 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-xs font-bold items-start">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <p className="uppercase tracking-wider rtl:tracking-normal font-sans font-bold text-[9px] mb-1 text-amber-900">
                {t("Règle de Sécurité Interne (DevSecOps)")}
              </p>
              {t(
                "Ce manuel est confidentiel et réservé à l'équipe de modération agréée OLMART. Ne l'imprimez ou ne le diffusez pas en dehors de vos canaux sécurisés."
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 border border-zinc-100 p-6 rounded-[2rem] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-sans font-bold text-[#ea580c] mb-3 uppercase tracking-wider rtl:tracking-normal">
                    {sec.title}
                  </h4>
                  <p className="text-zinc-600 text-xs font-medium leading-relaxed whitespace-pre-line">{sec.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable structure exclusively rendered for browser's Print operation */}
      <div id="olmart-printable-manual" className="hidden">
        <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', color: '#000000', backgroundColor: '#ffffff' }}>
          <div style={{ borderBottom: '2px solid #ea580c', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#18181b', letterSpacing: '-0.02em' }}>OLMART</h1>
            <p style={{ fontSize: '13px', color: '#ea580c', fontWeight: 'bold', margin: 0, letterSpacing: '0.1em' }}>
              {t("MARKETPLACE MULTI-VENDEURS • ALGÉRIE")}
            </p>
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#18181b', marginBottom: '15px' }}>
              {t("MANUEL DE GESTION & GUIDE D'UTILISATION")}
            </h2>
            <p style={{ fontSize: '12px', color: '#52525b', margin: '6px 0' }}>
              <strong>{t("Auteur :")}</strong> {t("Equipe de Developpement Full-Stack Senior & DevSecOps")}
            </p>
            <p style={{ fontSize: '12px', color: '#52525b', margin: '6px 0' }}>
              <strong>{t("Date de Generation :")}</strong> {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
          
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '12px', marginBottom: '40px', color: '#b45309', fontSize: '12px', lineHeight: '1.5' }}>
            <strong>{t("RECOMMANDATION SECURITE IMPORTANTE :")}</strong><br />
            {t("Ne partagez jamais vos identifiants d'administration supreme. Toute action est enregistree de maniere immuable dans les Audit Logs systeme et imputee a votre adresse email de session.")}
          </div>

          <div style={{ marginTop: '30px' }}>
            {sections.map((sec, idx) => (
              <div key={idx} style={{ pageBreakInside: 'avoid', marginBottom: '35px', borderTop: '1px solid #e4e4e7', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ea580c', marginBottom: '12px' }}>
                  {sec.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#27272a', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: '1px solid #e4e4e7', marginTop: '50px', paddingTop: '15px', fontSize: '10px', color: '#a1a1aa', textAlign: 'center' }}>
            {t("CONFIDENTIEL • RÉSERVÉ À L'ADMINISTRATION OLMART • © OLMART CO.")}
          </div>
        </div>
      </div>
    </div>
  );
};
