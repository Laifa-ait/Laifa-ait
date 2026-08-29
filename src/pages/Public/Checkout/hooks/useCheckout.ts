import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useCart } from '../../../../context/CartContext';
import { useAuth } from '../../../../context/AuthContext';
import { formatPrice } from '../../../../utils/format';
import { auth } from '../../../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { processCheckout } from '../../../../services/checkoutService';
import { getShippingLocations, calculateShippingRates, ShippingLocation, ShippingRateDetail } from '../../../../services/shippingClient';
import { apiPost } from '../../../../lib/api';
import { Shop } from "../../../../domains/seller/shop.types";
import { analyticsEngine } from '../../../../utils/analyticsEngine';
import { CartItem } from '../../../../domains/product/product.types';
import { Coupon, CouponDateType } from '../../../../domains/marketing/coupon.types';

export interface CheckoutOrderSummary {
  id: string;
  total: number;
  guestUserId: string;
  guestRecoveryToken?: string | null;
}

export const useCheckout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const filterSellerId = searchParams.get('sellerId');
  const { cart, clearCart, getCartItemPrice, revalidateCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  
  const [shippingData, setShippingData] = useState<{
    wilayas: ShippingLocation[];
    communes: Array<{ id: number; wilaya_id: number; name: string }>;
    centers: Array<{ id: number; wilaya_id: number; name: string }>;
  }>({ wilayas: [], communes: [], centers: [] });
  const [shippingRate, setShippingRate] = useState<ShippingRateDetail | null>(null);

  useEffect(() => {
     getShippingLocations().then(res => {
         if (res && res.data) {
             setShippingData(res.data);
         }
     }).catch(e => console.error("Could not fetch shipping locations", e));
  }, []);

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    wilaya: localStorage.getItem("olma_default_wilaya") || '',
    commune: '',
    address: '',
  });

  useEffect(() => {
    // Select first wilaya when data loads if none selected
    if (!formData.wilaya && shippingData.wilayas.length > 0) {
      setFormData(prev => ({ ...prev, wilaya: shippingData.wilayas[0].name }));
    }
  }, [formData.wilaya, shippingData.wilayas]);

  const isValidPhone = useMemo(() => {
    return !!formData.phone.replace(/\s+/g, '').match(/^(05|06|07|02|03|04|09)\d{8}$/);
  }, [formData.phone]);

  const [step, setStep] = useState('checkout'); // 'checkout' | 'success'
  const [activeAccordion, setActiveAccordion] = useState(1);
  const [successNotifPrompted, setSuccessNotifPrompted] = useState(false);

  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    return `ik_${currentUser?.uid || 'guest'}_${Date.now()}_${crypto.randomUUID()}`;
  });

  useEffect(() => {
     let cancelled = false;
     revalidateCart().catch(err => {
        if (!cancelled) console.error("Checkout cart hydration error:", err);
     });
     return () => { cancelled = true; };
  }, [revalidateCart]);

  const availableCommunes = useMemo(() => {
      if (!formData.wilaya) return [];
      const wilayaObj = shippingData.wilayas.find(w => w.name === formData.wilaya);
      if (!wilayaObj) return [];
      return shippingData.communes.filter(c => c.wilaya_id === wilayaObj.id).map(c => c.name);
  }, [formData.wilaya, shippingData]);

  const availableCenters = useMemo(() => {
      if (!formData.wilaya) return [];
      const wilayaObj = shippingData.wilayas.find(w => w.name === formData.wilaya);
      if (!wilayaObj) return [];
      return shippingData.centers.filter(c => c.wilaya_id === wilayaObj.id).map(c => c.name);
  }, [formData.wilaya, shippingData]);

  // Pre-select commune by default when wilaya changes for smooth UX & no empty selection
  useEffect(() => {
    if (formData.wilaya && availableCommunes.length > 0) {
      if (!formData.commune || !availableCommunes.includes(formData.commune)) {
        setFormData(prev => ({ ...prev, commune: availableCommunes[0] }));
      }
    }
  }, [formData.wilaya, availableCommunes, formData.commune]);

  useEffect(() => {
      if (formData.wilaya) {
          const wilayaObj = shippingData.wilayas.find(w => w.name === formData.wilaya);
          if (wilayaObj) {
              calculateShippingRates(wilayaObj.id).then(res => {
                  if (res && res.data) {
                      const rateData = res.data;
                      if (Array.isArray(rateData)) {
                          if (rateData.length > 0) {
                              setShippingRate(rateData[0]);
                          }
                      } else {
                          setShippingRate(rateData);
                      }
                  }
              }).catch(e => console.error(e));
          }
      }
  }, [formData.wilaya, shippingData.wilayas]);

  useEffect(() => {
     if (step === 'success' && !successNotifPrompted) {
        setSuccessNotifPrompted(true);
        setTimeout(() => {
           if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                 if (permission === 'granted') {
                    toast.success(t("notifications_activated_toast") || "Notifications activées ! Vous serez alerté dès que le livreur sera en approche (Push Dernier Kilomètre).", { duration: 6000, icon: '🔔' });
                 }
              });
           }
        }, 1500);
     }
  }, [step, successNotifPrompted, t]);

  const activeCart = useMemo(() => {
    if (!filterSellerId) return cart;
    return cart.filter(item => item.sellerId === filterSellerId);
  }, [cart, filterSellerId]);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'domicile' | 'stopdesk'>('domicile');
  const [selectedAgency, setSelectedAgency] = useState('');

  // Watch for wilaya changes to auto-select the first agency
  useEffect(() => {
    if (formData.wilaya) {
      if (availableCenters.length > 0) {
        setSelectedAgency(availableCenters[0]);
      }
    }
  }, [formData.wilaya, availableCenters]);

  // Watch currentUser and update name if it arrives late
  useEffect(() => {
    if (currentUser?.displayName && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: currentUser.displayName || '' }));
    }
  }, [currentUser, formData.fullName]);

  const [shops, setShops] = useState<Record<string, Shop>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeliveryInfoConfirmed, setIsDeliveryInfoConfirmed] = useState(false);
  const [deliveryRegId, setDeliveryRegId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSummary, setOrderSummary] = useState<CheckoutOrderSummary | null>(null);
  const [guestPassword, setGuestPassword] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);

  // Reset confirmation if user edits their details after confirming
  useEffect(() => {
    if (isDeliveryInfoConfirmed) {
      setIsDeliveryInfoConfirmed(false);
      setDeliveryRegId(null);
      toast.success(t("checkout.info_changed_notice", "Informations modifiées, veuillez valider à nouveau vos coordonnées de livraison à l'étape 3."));
    }
  }, [formData.fullName, formData.phone, formData.wilaya, formData.commune, formData.address, deliveryMethod, selectedAgency, isDeliveryInfoConfirmed, t]);

  const groupedCart = useMemo(() => {
    const groups: Record<string, { items: CartItem[], total: number, sellerName: string }> = {};
    activeCart.forEach(item => {
      const sId = item.sellerId || "default";
      if (!groups[sId]) {
         groups[sId] = { items: [], total: 0, sellerName: shops[sId]?.shopName || t("independent_store") || "Boutique Indépendante" };
      }
      groups[sId].items.push(item);
      groups[sId].total += (getCartItemPrice(item) * (item.quantity || 1));
    });
    return groups;
  }, [activeCart, shops, getCartItemPrice, t]);

  const subtotal = useMemo(() => activeCart.reduce((sum, item) => sum + (getCartItemPrice(item) * (item.quantity || 1)), 0), [activeCart, getCartItemPrice]);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
       toast.error(t("checkout.empty_coupon_error", "Veuillez entrer un code coupon."));
       return;
    }
    if (!activeCart || activeCart.length === 0) {
       toast.error(t("checkout.empty_cart_error", "Votre panier est vide."));
       return;
    }
    setIsValidatingCoupon(true);
    try {
      const couponItems = activeCart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || undefined,
      }));

      const data = await apiPost<{ coupon: Coupon; discountAmount?: number }>(`/api/v1/checkout/validate-coupon`, {
        code: couponInput.trim(),
        items: couponItems,
      });
      if (!data || !data.coupon) {
        toast.error(t("checkout.invalid_coupon_error", "Code promo ou coupon invalide."));
        setAppliedCoupon(null);
        setCouponDiscount(0);
        return;
      }
      
      const couponData = data.coupon;
      if (!couponData.isActive) {
        toast.error(t("checkout.inactive_coupon_error", "Ce coupon est inactif."));
        return;
      }
      
      if (couponData.expiresAt || couponData.expiryDate) {
        let expiry: Date | null = null;
        const rawExpiry: CouponDateType = couponData.expiresAt || couponData.expiryDate;
        
        if (rawExpiry instanceof Date) {
          expiry = isNaN(rawExpiry.getTime()) ? null : rawExpiry;
        } else if (typeof rawExpiry === 'string' || typeof rawExpiry === 'number') {
          const d = new Date(rawExpiry);
          expiry = isNaN(d.getTime()) ? null : d;
        } else if (typeof rawExpiry === 'object' && rawExpiry !== null) {
          if ('toDate' in rawExpiry && typeof rawExpiry.toDate === 'function') {
            expiry = rawExpiry.toDate();
          } else if ('seconds' in rawExpiry && typeof rawExpiry.seconds === 'number') {
            expiry = new Date(rawExpiry.seconds * 1000);
          } else if ('_seconds' in rawExpiry && typeof rawExpiry._seconds === 'number') {
            expiry = new Date(rawExpiry._seconds * 1000);
          }
        }

        if (expiry && !isNaN(expiry.getTime()) && expiry <= new Date()) {
          toast.error(t("checkout.expired_coupon_error", "Ce coupon a expiré."));
          return;
        }
      }
      
      const minReq = couponData.minOrderValue ?? couponData.minOrderAmount ?? 0;
      if (subtotal < minReq) {
        toast.error(t("checkout.min_order_error", "Minimum d'achat requis pour ce coupon : {{amount}}", { amount: formatPrice(minReq) }));
        return;
      }

      if (couponData.usageLimit && (couponData.usedCount || 0) >= couponData.usageLimit) {
        toast.error(t("checkout.usage_limit_error", "La limite d'utilisation de ce coupon est de {{limit}} fois.", { limit: couponData.usageLimit }));
        return;
      }

      let amount = typeof data.discountAmount === "number" ? data.discountAmount : 0;
      if (!amount) {
        if (couponData.discountType === 'percentage') {
           amount = (subtotal * couponData.discountValue) / 100;
        } else {
           amount = Math.min(couponData.discountValue, subtotal);
        }
      }
      
      setAppliedCoupon(couponData);
      setCouponDiscount(amount);
      toast.success(t("checkout.coupon_applied", "Coupon \"{{code}}\" appliqué (-{{amount}}) ! 🎫", { code: couponData.code, amount: formatPrice(amount) }));
    } catch (e: unknown) {
      console.error(e);
      const errObj = e as { error?: string; message?: string };
      const msg = errObj?.error || errObj?.message || t("checkout.coupon_validation_error", "Erreur lors de la validation du coupon.");
      toast.error(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    toast.success(t("checkout.coupon_removed", "Coupon retiré."));
  };



  useEffect(() => {
    const fetchShops = async () => {
      try {
        const sellerIds = Array.from(new Set(activeCart.map(item => item.sellerId).filter(Boolean))) as string[];
        if (sellerIds.length === 0) return;
        const data = await apiPost<{ profiles: Record<string, { shopName?: string; [key: string]: unknown }> }>('/api/v1/public-profiles', { ids: sellerIds });
        if (data && data.profiles) {
          const shopData: Record<string, Shop> = {};
          Object.entries(data.profiles).forEach(([id, profile]) => {
            shopData[id] = { uid: id, ...profile } as unknown as Shop;
          });
          setShops(shopData);
        }
      } catch (err) {
        console.error("Error fetching shops in checkout:", err);
      }
    };
    if (activeCart.length > 0) fetchShops();
  }, [activeCart]);

  useEffect(() => {
    if (activeCart.length > 0) {
      analyticsEngine.track('checkout_start', { itemsCount: activeCart.length, subtotal });
    }
  }, [activeCart.length, subtotal]);

  const totalShipping = useMemo(() => {
    if (shippingRate) {
      if (deliveryMethod === 'domicile') {
        return shippingRate.home_delivery_fee || 600;
      }
      return shippingRate.desk_fee || 400;
    }
    return deliveryMethod === 'domicile' ? 600 : 400;
  }, [deliveryMethod, shippingRate]);

  const grandTotal = Math.max(0, subtotal - couponDiscount + totalShipping);

  const handleConfirmDeliveryInfo = async (): Promise<void> => {
    if (!formData.fullName) {
      toast.error(t("enter_name_error") || "Veuillez saisir votre nom.");
      return;
    }
    if (!currentUser && !formData.email) {
      toast.error(t("enter_email_error") || "Veuillez saisir votre adresse e-mail.");
      return;
    }
    if (!currentUser && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t("invalid_email_error") || "L'adresse e-mail est invalide.");
      return;
    }
    if (!isValidPhone) {
      toast.error(t("invalid_phone_error") || "Le numéro de téléphone est invalide.");
      return;
    }
    if (!formData.commune || !formData.address) {
      toast.error(t("incomplete_address_error") || "L'adresse de livraison est incomplète.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      const refId = `REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      if (currentUser) {
         await apiPost("/api/v1/auth/profile", {
           uid: currentUser.uid,
           email: currentUser.email || "",
           displayName: formData.fullName,
           phone: cleanPhone,
           wilaya: formData.wilaya,
           commune: formData.commune,
           address: formData.address,
         });
      }

      let idToken = "";
      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken();
        } catch (tokenErr) {
          console.warn("Failed to retrieve auth ID token:", tokenErr);
        }
      }

      const finalAddress = deliveryMethod === 'stopdesk'
        ? `STOP DESK (Bureau de Retrait) : ${selectedAgency} | Repère : ${formData.address}`
        : formData.address;

      const response = await fetch("/api/v1/checkout/confirm-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          id: refId,
          fullName: formData.fullName,
          email: formData.email || "",
          phone: cleanPhone,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: finalAddress,
          deliveryMethod,
          items: activeCart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity || 1,
            price: item.promoPrice || item.price,
            selectedVariant: item.selectedVariant || null
          })),
          total: grandTotal,
          userId: currentUser?.uid || "guest"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t("checkout.save_delivery_error", "Erreur lors de l'enregistrement de vos informations de livraison."));
      }
      
      setDeliveryRegId(refId);
      setIsDeliveryInfoConfirmed(true);
      
      analyticsEngine.track('delivery_info_confirmed', {
         registrationId: refId,
         totalAmount: grandTotal,
         itemsCount: activeCart.length
      });

      toast.success(t("checkout.info_confirmed_success", "Coordonnées de livraison validées avec succès !"));
    } catch (err: unknown) {
      console.error("OLMART delivery confirmation failed:", err);
      const errMsg = err instanceof Error ? err.message : "";
      toast.error(errMsg || t("confirmation_error") || "Erreur lors de la confirmation de vos informations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (!isDeliveryInfoConfirmed) {
      toast.error(t("checkout.please_confirm_info_first", "Veuillez d'abord confirmer vos informations de livraison à l'étape 3."));
      return;
    }
    
    setIsSubmittingOrder(true);
    try {
      const finalAddress = deliveryMethod === 'stopdesk'
        ? `STOP DESK (Bureau de Retrait) : ${selectedAgency} | Repère : ${formData.address}`
        : formData.address;

      const sendData = { 
        ...formData, 
        name: formData.fullName, 
        phone: formData.phone.replace(/\s+/g, ''),
        address: finalAddress
      };

      const payload = {
        cart: activeCart.map(item => ({
             id: item.id,
             quantity: item.quantity || 1,
             sellerId: item.sellerId || "admin",
             selectedVariant: item.selectedVariant || null,
             priceSeen: item.promoPrice || item.price
        })),
        shippingAddress: sendData,
        deliveryMethod,
        billingAddress: sendData,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        idempotencyKey,
      };

      const data = await processCheckout(payload);
      
      setOrderSummary({ 
         id: data.orderId || deliveryRegId || `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, 
         total: data.total || grandTotal, 
         guestUserId: data.guestUserId || (currentUser?.uid || "guest"),
         guestRecoveryToken: data.guestRecoveryToken || null,
      });

      analyticsEngine.track('purchase_complete', {
         orderId: data.orderId,
         totalAmount: data.total,
         itemsCount: activeCart.length
      });

      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      clearCart(filterSellerId || undefined);
      setIdempotencyKey(`ik_${currentUser?.uid || 'guest'}_${Date.now()}_${crypto.randomUUID()}`);
      setStep('success');
    } catch (err: unknown) {
      console.error("OLMART order finalization failed:", err);
      const errMsg = err instanceof Error ? err.message : "";
      toast.error(errMsg || t("checkout.order_finalization_error", "Erreur lors de la finalisation de votre commande."));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleGuestToFullConversion = async (): Promise<void> => {
    if (!guestPassword || guestPassword.length < 6) {
      toast.error(t("password_too_short") || "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setIsConverting(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, guestPassword);

      await apiPost("/api/v1/auth/convert-guest", {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone.replace(/\s+/g, ''),
        wilaya: formData.wilaya,
        commune: formData.commune,
        address: formData.address,
        guestUserId: orderSummary?.guestUserId || null,
        guestRecoveryToken: orderSummary?.guestRecoveryToken || null,
      });

      toast.success(t("account_converted_success") || "Compte créé avec succès ! Vos commandes sont maintenant associées.");
      setIsConverted(true);
    } catch (err: unknown) {
      console.error("Guest conversion failed:", err);
      const errMsg = err instanceof Error ? err.message : "";
      toast.error(errMsg || "La conversion de compte a échoué.");
    } finally {
      setIsConverting(false);
    }
  };

  return {
    navigate,
    t,
    filterSellerId,
    activeCart,
    currentUser,
    userProfile,
    formData,
    setFormData,
    isValidPhone,
    step,
    setStep,
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
  };
};
