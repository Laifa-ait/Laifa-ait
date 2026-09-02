import React, { useEffect, useState } from "react";
import { Joyride, EventData, STATUS, Step } from "react-joyride";
import { useTranslation } from "react-i18next";

interface SellerOnboardingTourProps {
  forceRun?: boolean;
  onTourEnd?: () => void;
}

const STORAGE_KEY = "olmart_seller_tour_completed";

export const SellerOnboardingTour: React.FC<SellerOnboardingTourProps> = ({
  forceRun = false,
  onTourEnd,
}) => {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (forceRun || !hasCompleted) {
      // Petite temporisation pour s'assurer que le DOM est complètement monté
      const timer = setTimeout(() => {
        setRun(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [forceRun]);

  const steps: Step[] = [
    {
      target: "#seller-desktop-sidebar, #seller-mobile-header",
      content: (
        <div>
          <h4 className="font-bold text-zinc-900 text-base mb-1">
            {t("seller.tour.welcome_title", "Bienvenue sur votre Espace Vendeur Olmart ! 🇩🇿")}
          </h4>
          <p className="text-zinc-600 text-sm">
            {t(
              "seller.tour.welcome_desc",
              "Gérez l'ensemble de votre commerce en ligne, vos stocks et vos expéditions à travers toute l'Algérie depuis ce tableau de bord unifié."
            )}
          </p>
        </div>
      ),
      placement: "right",
      skipBeacon: true,
    },
    {
      target: "#seller-nav-catalog",
      content: (
        <div>
          <h4 className="font-bold text-zinc-900 text-base mb-1">
            {t("seller.tour.catalog_title", "📦 Catalogue & Produits")}
          </h4>
          <p className="text-zinc-600 text-sm">
            {t(
              "seller.tour.catalog_desc",
              "Ajoutez vos articles en quelques clics, importez des photos haute résolution optimisées automatiquement et suivez vos stocks en temps réel."
            )}
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#seller-nav-orders",
      content: (
        <div>
          <h4 className="font-bold text-zinc-900 text-base mb-1">
            {t("seller.tour.orders_title", "🛍️ Commandes & Traitement")}
          </h4>
          <p className="text-zinc-600 text-sm">
            {t(
              "seller.tour.orders_desc",
              "Consultez les nouvelles commandes reçues, confirmez les colis et imprimez vos bordereaux d'expédition en un clic."
            )}
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#seller-nav-shipping",
      content: (
        <div>
          <h4 className="font-bold text-zinc-900 text-base mb-1">
            {t("seller.tour.shipping_title", "🚚 Expéditions & 58 Wilayas")}
          </h4>
          <p className="text-zinc-600 text-sm">
            {t(
              "seller.tour.shipping_desc",
              "Personnalisez vos tarifs de livraison à domicile et en point relais pour chaque wilaya d'Algérie."
            )}
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#seller-nav-analytics",
      content: (
        <div>
          <h4 className="font-bold text-zinc-900 text-base mb-1">
            {t("seller.tour.analytics_title", "📊 Statistiques & Performances")}
          </h4>
          <p className="text-zinc-600 text-sm">
            {t(
              "seller.tour.analytics_desc",
              "Suivez votre chiffre d'affaires, les produits les plus vendus et l'évolution de votre activité avec des graphiques clairs."
            )}
          </p>
        </div>
      ),
      placement: "right",
    },
  ];

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(STORAGE_KEY, "true");
      if (onTourEnd) {
        onTourEnd();
      }
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideEvent}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        showProgress: true,
        skipBeacon: true,
        primaryColor: "#ea580c",
        textColor: "#18181b",
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        overlayColor: "rgba(9, 9, 11, 0.45)",
        zIndex: 99999,
      }}
      locale={{
        back: t("common.back", "Précédent"),
        close: t("common.close", "Fermer"),
        last: t("seller.tour.finish", "Terminer"),
        next: t("common.next", "Suivant"),
        skip: t("seller.tour.skip", "Passer le tour"),
      }}
      styles={{
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
        buttonPrimary: {
          backgroundColor: "#ea580c",
          borderRadius: "10px",
          padding: "10px 18px",
          fontSize: "13px",
          fontWeight: "bold",
        },
        buttonBack: {
          color: "#71717a",
          fontSize: "13px",
          fontWeight: "600",
          marginRight: "10px",
        },
        buttonSkip: {
          color: "#a1a1aa",
          fontSize: "12px",
        },
      }}
    />
  );
};
