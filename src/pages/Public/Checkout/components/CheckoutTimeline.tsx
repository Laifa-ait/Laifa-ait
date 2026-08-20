import React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutTimelineProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
  isStep2Completed: boolean;
  onNavigateToCart: () => void;
}

export const CheckoutTimeline: React.FC<CheckoutTimelineProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isStep2Completed,
  onNavigateToCart,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-8 mb-4 max-w-3xl mx-auto" id="checkout-timeline">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Connector */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-stone-200 z-0">
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: "0%" }}
            animate={{
              width:
                activeAccordion === 1
                  ? "33%"
                  : activeAccordion === 2
                  ? "66%"
                  : "100%",
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step 1: Cart */}
        <button
          onClick={onNavigateToCart}
          className="z-10 flex flex-col items-center group cursor-pointer bg-none border-none outline-none"
          type="button"
          id="timeline-step-cart"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white border-4 border-white shadow flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {t("checkout.timeline_cart", "Panier")}
          </span>
        </button>

        {/* Step 2: Identity */}
        <button
          onClick={() => {
            if (isStep1Completed) setActiveAccordion(1);
          }}
          disabled={!isStep1Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-none border-none outline-none"
          type="button"
          id="timeline-step-identity"
        >
          <div
            className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-sm transition-all ${
              activeAccordion === 1
                ? "bg-zinc-950 text-white scale-110"
                : isStep1Completed
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {isStep1Completed && activeAccordion !== 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "1"
            )}
          </div>
          <span
            className={`text-[10px] font-sans font-bold uppercase tracking-wider mt-2 ${
              activeAccordion === 1
                ? "text-zinc-950 underline decoration-2"
                : isStep1Completed
                ? "text-emerald-600"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_identity", "Coordonnées")}
          </span>
        </button>

        {/* Step 3: Shipping */}
        <button
          onClick={() => {
            if (isStep1Completed && isStep2Completed) setActiveAccordion(2);
          }}
          disabled={!isStep1Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-none border-none outline-none"
          type="button"
          id="timeline-step-shipping"
        >
          <div
            className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-sm transition-all ${
              activeAccordion === 2
                ? "bg-zinc-950 text-white scale-110"
                : isStep2Completed && isStep1Completed
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {isStep2Completed && isStep1Completed && activeAccordion !== 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "2"
            )}
          </div>
          <span
            className={`text-[10px] font-sans font-bold uppercase tracking-wider mt-2 ${
              activeAccordion === 2
                ? "text-zinc-950 underline decoration-2"
                : isStep2Completed
                ? "text-emerald-600"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_shipping", "Livraison")}
          </span>
        </button>

        {/* Step 4: Review & Pay */}
        <button
          onClick={() => {
            if (isStep1Completed && isStep2Completed) setActiveAccordion(3);
          }}
          disabled={!isStep1Completed || !isStep2Completed}
          className="z-10 flex flex-col items-center group disabled:cursor-not-allowed bg-none border-none outline-none"
          type="button"
          id="timeline-step-validation"
        >
          <div
            className={`w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-sm transition-all ${
              activeAccordion === 3
                ? "bg-zinc-950 text-white scale-110"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            3
          </div>
          <span
            className={`text-[10px] font-sans font-bold uppercase tracking-wider mt-2 ${
              activeAccordion === 3
                ? "text-zinc-950 underline decoration-2"
                : "text-stone-400"
            }`}
          >
            {t("checkout.timeline_validation", "Validation")}
          </span>
        </button>
      </div>
    </div>
  );
};
