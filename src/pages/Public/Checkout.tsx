import React from 'react';
import { Package } from 'lucide-react';
import { PremiumLayout } from '../../components/Layout/PremiumLayout';

// Sub-components
import { CheckoutTimeline } from "./Checkout/components/CheckoutTimeline";
import { CheckoutStepIdentity } from "./Checkout/components/CheckoutStepIdentity";
import { CheckoutStepShipping } from "./Checkout/components/CheckoutStepShipping";
import { CheckoutStepValidation } from "./Checkout/components/CheckoutStepValidation";
import { CheckoutSummarySidebar } from "./Checkout/components/CheckoutSummarySidebar";
import { CheckoutSuccess } from "./Checkout/components/CheckoutSuccess";

import { useCheckout } from "./Checkout/hooks/useCheckout";

export const Checkout: React.FC = () => {
  const {
    navigate,
    t,
    activeCart,
    currentUser,
    userProfile,
    formData,
    setFormData,
    isValidPhone,
    step,
    activeAccordion,
    setActiveAccordion,
    deliveryMethod,
    setDeliveryMethod,
    selectedAgency,
    setSelectedAgency,
    isSubmitting,
    isDeliveryInfoConfirmed,
    setIsDeliveryInfoConfirmed,
    isSubmittingOrder,
    orderSummary,
    guestPassword,
    setGuestPassword,
    isConverting,
    isConverted,
    groupedCart,
    subtotal,
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponDiscount,
    isValidatingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    totalShipping,
    grandTotal,
    handleConfirmDeliveryInfo,
    handlePlaceOrder,
    handleGuestToFullConversion,
    getCartItemPrice,
    shippingData,
    availableCommunes,
    availableCenters
  } = useCheckout();

  if (activeCart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
         <Package className="w-16 h-16 text-zinc-200 mb-8" />
         <h2 className="text-3xl font-sans font-bold tracking-tight rtl:tracking-normal mb-4 text-zinc-950">{t("empty_cart") || "Panier vide"}</h2>
         <button onClick={() => navigate('/shop')} className="btn-premium-orange">{t("to_shop") || "Vers la Boutique"}</button>
      </div>
    );
  }

  const isStep1Completed = isValidPhone && !!formData.fullName.trim();
  const isStep2Completed = !!(formData.commune && formData.address);

  return (
    <PremiumLayout>
       <div className="pt-24 lg:pt-32 pb-32">
          {step === 'checkout' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto px-4 lg:px-8">
                 <div className="col-span-1 lg:col-span-12 mb-4">
                    <h1 className="text-4xl md:text-5xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] tracking-tighter rtl:tracking-normal">{t("checkout") || "Validation"}</h1>
                    
                    <CheckoutTimeline 
                      activeAccordion={activeAccordion}
                      setActiveAccordion={setActiveAccordion}
                      isStep1Completed={isStep1Completed}
                      isStep2Completed={isStep2Completed}
                      onNavigateToCart={() => navigate('/cart')}
                    />
                 </div>

                 <div className="col-span-1 lg:col-span-7 space-y-6">
                    <CheckoutStepIdentity 
                      activeAccordion={activeAccordion}
                      setActiveAccordion={setActiveAccordion}
                      isStep1Completed={isStep1Completed}
                      isValidPhone={isValidPhone}
                      formData={formData}
                      setFormData={setFormData}
                      currentUser={currentUser}
                    />

                    <CheckoutStepShipping 
                      activeAccordion={activeAccordion}
                      setActiveAccordion={setActiveAccordion}
                      isStep1Completed={isStep1Completed}
                      isStep2Completed={isStep2Completed}
                      isValidPhone={isValidPhone}
                      formData={formData}
                      setFormData={setFormData}
                      deliveryMethod={deliveryMethod}
                      setDeliveryMethod={setDeliveryMethod}
                      selectedAgency={selectedAgency}
                      setSelectedAgency={setSelectedAgency}
                      availableCommunes={availableCommunes}
                      availableCenters={availableCenters}
                      shippingData={shippingData}
                    />

                    <CheckoutStepValidation 
                      activeAccordion={activeAccordion}
                      setActiveAccordion={setActiveAccordion}
                      formData={formData}
                      deliveryMethod={deliveryMethod}
                      selectedAgency={selectedAgency}
                      isDeliveryInfoConfirmed={isDeliveryInfoConfirmed}
                      setIsDeliveryInfoConfirmed={setIsDeliveryInfoConfirmed}
                      handleConfirmDeliveryInfo={handleConfirmDeliveryInfo}
                      isSubmitting={isSubmitting}
                    />
                 </div>

                 <CheckoutSummarySidebar 
                   groupedCart={groupedCart}
                   activeAccordion={activeAccordion}
                   appliedCoupon={appliedCoupon}
                   couponInput={couponInput}
                   setCouponInput={setCouponInput}
                   handleApplyCoupon={handleApplyCoupon}
                   handleRemoveCoupon={handleRemoveCoupon}
                   isValidatingCoupon={isValidatingCoupon}
                   subtotal={subtotal}
                   couponDiscount={couponDiscount}
                   totalShipping={totalShipping}
                   userProfile={userProfile}
                   grandTotal={grandTotal}
                   handlePlaceOrder={handlePlaceOrder}
                   isSubmittingOrder={isSubmittingOrder}
                   isDeliveryInfoConfirmed={isDeliveryInfoConfirmed}
                   getCartItemPrice={getCartItemPrice}
                 />
              </div>
          )}

          {step === 'success' && (
             <CheckoutSuccess 
               orderSummary={orderSummary}
               currentUser={currentUser}
               formData={formData}
               guestPassword={guestPassword}
               setGuestPassword={setGuestPassword}
               isConverted={isConverted}
               isConverting={isConverting}
               handleGuestToFullConversion={handleGuestToFullConversion}
               onNavigateToTracking={() => navigate('/buyer/orders')}
               onNavigateToShop={() => navigate('/shop')}
             />
          )}
       </div>
    </PremiumLayout>
  );
};
export default Checkout;
