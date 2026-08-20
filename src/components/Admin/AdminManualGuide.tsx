import React, { useState } from "react";
import { BookOpen, ChevronUp, ChevronDown, Download, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

const getGuideSections = (t: TFunction) => [
  {
    title: t("1. Introduction et Philosophie d'OLMART"),
    content: t(
      "OLMART (Olma Marketplace) est une plateforme e-commerce multi-vendeurs de dernière génération conçue spécifiquement pour adresser les défis et opportunités du marché algérien.\n\nPrincipes Clés :\n- Mobile-First Absolu : L'interface utilisateur est entièrement pensée comme une application native haut de gamme avec sa barre de navigation inférieure fixe (Bottom Navigation Bar), des transitions fluides, et une ergonomie tactile réactive.\n- Identité Visuelle Texturée : Palette chromatique beige sable et blanc immaculé donnant un aspect moderne et épuré, contrasté par un orange vif chaleureux pour les boutons d'engagement.\n- Souveraineté des données d'OLMART : Étant donné les contraintes de sécurité, toutes les interactions (ventes, litiges, négociations, alertes) s'effectuent via les canaux internes intégrés. Aucun contournement par des messageries ou applications tierces n'est autorisé afin de garantir l'intégrité de l'arbitrage financier en cas de litige."
    ),
  },
  {
    title: t("2. Sécurité et Protocoles de transaction (DevSecOps)"),
    content: t(
      "La plateforme repose sur une architecture Cloud sécurisée combinant React, Vite et la suite Firebase (Firestore, Auth, Storage) avec un serveur intermédiaire Express configuré selon les standards OWASP les plus stricts.\n\nLe triptyque de contrôle d'accès :\n- Le Client (Acheteur) : Pouvoirs limités à la navigation, l'évaluation des produits reçus, l'ajout au panier, le paiement par paiement à la livraison (COD) et l'émission de réclamations/retours sur ses commandes.\n- Le Vendeur (Seller) : Espace étanche. Un vendeur ne peut voir que ses propres produits, ses propres finances, ses commandes, ses évaluations et ses demandes d'approbation.\n- L'Administrateur (Admin) : Seul rôle ayant une visibilité totale sur l'écosystème. Il gère la conformité juridique (KYC), valide les produits, tranche les litiges, configure l'ordre de la page d'accueil, gère la monétique et surveille les journaux d'audit (Audit Logs) pour retracer chaque action."
    ),
  },
  {
    title: t("3. Le Storefront Public (Côté Client)"),
    content: t(
      "Cette rubrique comprend le site internet général accessible à tous les visiteurs et acheteurs en Algérie :\n- Page d'Accueil : Vitrine personnalisable supportant des bannières saisonnières éditables (Ramadan, Rentrée Scolaire, Hiver, Été), des carrousels de ventes privées et de promotions.\n- Authentification : Écran central de connexion unifiée avec gestion transparente des types de compte (Acheteur contre Vendeur).\n- Onboarding Vendeur : Formulaire guidé invitant les nouveaux vendeurs à configurer le nom de leur boutique et leurs coordonnées.\n- Catalogue & Filtres : Moteur de recherche et de catégorisation intelligent avec tri par Wilaya, prix, avis, et catégories parentes.\n- Détails Produit : Fiche produit riche affichant les stocks temps réel, les notes, avis acheteurs vérifiés, et un sélecteur de variantes.\n- Boutiques Vendeurs : Mini-site dédié pour chaque vendeur agréé OLMART, présentant logo, charte, notes et son inventaire.\n- Calculateur de Livraison : Permet aux internautes de simuler leurs frais de port en fonction de la Wilaya de départ et d'arrivée.\n- Panier & Commande : Tunnel d'achat structuré avec saisie des informations de livraison adaptées au format postal algérien."
    ),
  },
  {
    title: t("4. Le Tableau de Bord Vendeur (Vendor Dashboard)"),
    content: t(
      "Contrôlable à l'adresse /seller, cette section permet aux commerçants agréés de gérer leurs opérations :\n- Vue d'Ensemble : Chiffre d'affaires brut consolidé, nombre de ventes, taux d'annulation.\n- Gestion du Catalogue : Fiches produits avec titres bilingues (FR/AR), descriptions, prix publics, prix promotionnels et gestion fine des stocks.\n- Commandes & Expédition : Traitement étape par étape de la commande et impression des étiquettes d'acheminement standard OLMART.\n- Portefeuille Financier : Suivi du solde disponible (commandes effectivement livrées et encaissées) et demandes de virement CCP.\n- Gestion des Retours : Gestion des réclamations clients et acceptation d'étiquettes de retour.\n- Documents de Conformité : Hub KYC pour soumettre : Registre du Commerce (RC), Pièce d'identité nationale valide, et RIB/RIP pour la liaison financière."
    ),
  },
  {
    title: t("5. Le Panneau d'Administration Principal (Admin Dashboard)"),
    content: t(
      "Accessible uniquement par les comptes admin, ce panneau contrôle la conformité d'OLMART :\n- Vue d'Ensemble Financière : KPI globaux (GMV, commissions perçues, litiges en cours).\n- Modération des Vendeurs : Validation des documents KYC (RC, Pièce d'identité, RIB).\n- Modération des Fiches Produits : Examen et modération pour éradiquer les prix mensongers ou interdits.\n- Éditeur de Catégories : Structuration des rayons et gestion du Méga Menu pour le e-commerce.\n- Bannières & Homepage Builder : Éléments promotionnels et agencement personnalisé de la page d'accueil.\n- Arbitrage des Litiges : Rôle de tiers de confiance pour trancher sur les dépôts de preuve en cas d'incident.\n- Journaux d'Audit & Sécurité : Enregistrement de chaque événement sensible d'administration pour interdire toute action malveillante."
    ),
  },
  {
    title: t("6. Sponsoring et Visibilité Algorithmique"),
    content: t(
      "Le système de Sponsoring permet aux vendeurs de propulser leurs produits :\n- Badge Visuel : Un badge 'Sponsorisé' distinguera l'article dans toutes les grilles du site.\n- Priorité Absolue : L'algorithme de tri applique un coefficient multiplicateur de visibilité. Tout produit sponsorisé s'affiche automatiquement en pole position des résultats de recherche.\n- Équité Concurrentielle : L'affichage alterne de manière aléatoire et équitable si plusieurs vendeurs sponsorisent la même catégorie.\n- Processus de Validation : Soumission par le vendeur ➔ Modération par l'administration sous 48h (vérification de la qualité d'image et de l'éthique de tarification) ➔ Activation publique."
    ),
  },
  {
    title: t("7. Logistique Algérienne & Modèle Vendeur"),
    content: t(
      "OLMART intègre la couverture logistique des 58 Wilayas algériennes :\n- Responsabilité Vendeur : Chaque vendeur assure la livraison de ses commandes (livreur propre ou transporteur externe de son choix).\n- Modes de Livraison : À Domicile (Home Delivery) ou En Point de Retrait (Desk Delivery) selon les options configurées par le vendeur.\n- Cash on Delivery (COD) : Recouvrement direct du montant en espèces à la livraison, suivi du déblocage automatique des fonds du vendeur après confirmation du statut Livré."
    ),
  },
  {
    title: t("8. Guide de Démarrage Rapide de l'Administrateur"),
    content: t(
      "Pour démarrer vos activités en tant qu'administrateur suprême OLMART :\n1. Configuration des Rayons : Créez vos premières rubriques dans Categories Admin.\n2. Données de Test : Utilisez le DB Seed Admin pour peupler instantanément la base avec des vendeurs et produits démos.\n3. Surveillance : Inspectez continuellement les Audit Logs pour déceler toute faille ou action insolite.\n4. Traductions & Publicité : Personnalisez les textes bilingues dans Translation Admin et configurez des bannières de saison dans Banner Admin.\n5. Règlement des Litiges : Vérifiez régulièrement les dossiers de litige clients pour maintenir un espace commercial de confiance."
    ),
  },
];

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

    while (heightLeft >= 0) {
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

      {/* Printable structure exclusively rendered for browser's Print operation (hidden on normal screens, displayed only during printing) */}
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
