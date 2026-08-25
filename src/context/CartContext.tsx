import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { Product, CartItem } from "../domains/product/product.types";
import { useAuth } from "./AuthContext";
import { analyticsEngine } from "../utils/analyticsEngine";
import { apiGet, apiPost } from "../lib/api";
import toast from "react-hot-toast";

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (productOrId: string | Product, sellerIdOrOptions?: string | Record<string, unknown>, options?: Record<string, unknown>) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: (sellerId?: string) => void;
  toggleWishlist: (id: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  revalidateCart: () => Promise<void>;
  getCartItemPrice: (item: CartItem) => number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getWishlistKey = (uid?: string | null) => (uid ? `olma_wishlist_${uid}` : "olma_wishlist_guest");
const getCartKey = (uid?: string | null) => (uid ? `olma_cart_${uid}` : "olma_cart_guest");

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const prevUserRef = useRef<FirebaseUser | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs to prevent background fetch race conditions (Deduplication + Cache maps)
  const productDetailsCache = useRef<Record<string, Product>>({});
  const activeProductFetches = useRef<Record<string, Promise<Product | null>>>({});

  // Hydrate cart from backend (prices/names) to avoid stale data
  const hydrateCart = async (cartItems: CartItem[]): Promise<CartItem[]> => {
    if (!cartItems || cartItems.length === 0) return [];

    const uniqueIds = Array.from(new Set(cartItems.map((item) => item.id)));
    const productDataMap = new Map<string, Product>();

    try {
      const res = await apiPost<{ products: Product[] }>("/api/v1/products/batch", { ids: uniqueIds });
      if (res && Array.isArray(res.products)) {
        res.products.forEach((p: Product) => {
          productDataMap.set(p.id, p);
        });
      }
    } catch (e) {
      console.error("Hydration batch API error:", e);
    }

    const hydrated = cartItems.map((item) => {
      const pData = productDataMap.get(item.id);
      if (pData) {
        return {
          ...item,
          addedAt: item.addedAt || Date.now(),
          name: pData.name,
          price: pData.price,
          promoPrice: pData.promoPrice,
          image: pData.image || pData.images?.[0] || item.image,
          variants: pData.variants || item.variants,
        };
      }
      return item; // fallback
    });
    return hydrated;
  };

  // Sync cart and merge from guest to user
  useEffect(() => {
    setIsInitialized(false);
    const handleAuthChange = async () => {
      let finalCart: CartItem[];
      let finalWishlist: string[];

      const safeParse = <T,>(data: string | null, fallback: T): T => {
        try {
          return data ? JSON.parse(data) : fallback;
        } catch {
          return fallback;
        }
      };

      const guestCartJson = localStorage.getItem("olma_cart_guest");
      const guestCart = safeParse(guestCartJson, []);
      const guestWishlistJson = localStorage.getItem("olma_wishlist_guest");
      const guestWishlist = safeParse(guestWishlistJson, []);

      try {
        if (auth.currentUser) {
          // User is logged in
          const userCartKey = getCartKey(auth.currentUser.uid);
          const userWishlistKey = getWishlistKey(auth.currentUser.uid);

          // Fetch user data from Cloud via secure REST endpoints
          let cloudCart: CartItem[] = [];
          let cloudWishlist: string[] = [];

          try {
            const cartRes = await apiGet<{ items?: CartItem[] }>("/api/v1/auth/cart");
            if (cartRes && Array.isArray(cartRes.items)) {
              cloudCart = cartRes.items;
            }
          } catch (err) {
            console.warn("CartContext: Cloud cart fetch failed. Falling back to local storage.", err);
          }

          try {
            const wishRes = await apiGet<{ items?: string[] }>("/api/v1/auth/wishlist");
            if (wishRes && Array.isArray(wishRes.items)) {
              cloudWishlist = wishRes.items;
            }
          } catch (err) {
            console.warn("CartContext: Cloud wishlist fetch failed. Falling back to local storage.", err);
          }

          // Fallback to localStorage if cloud is empty
          if (cloudCart.length === 0) {
            const localUserCart = localStorage.getItem(userCartKey);
            if (localUserCart) cloudCart = safeParse(localUserCart, []);
          }
          if (cloudWishlist.length === 0) {
            const localUserWish = localStorage.getItem(userWishlistKey);
            if (localUserWish) cloudWishlist = safeParse(localUserWish, []);
          }

          // MERGE Guest Cart into User Cart if transition just happened
          if (!prevUserRef.current && guestCart.length > 0) {
            guestCart.forEach((gItem: CartItem) => {
              const existingMerge = cloudCart.find(
                (c: CartItem) => c.id === gItem.id && c.selectedVariant === gItem.selectedVariant
              );
              if (existingMerge) {
                existingMerge.quantity += gItem.quantity || 1;
              } else {
                cloudCart.push(gItem);
              }
            });
            localStorage.removeItem("olma_cart_guest");
          }

          // Merge wishlist
          if (!prevUserRef.current && guestWishlist.length > 0) {
            guestWishlist.forEach((wId: string) => {
              if (!cloudWishlist.includes(wId)) cloudWishlist.push(wId);
            });
            localStorage.removeItem("olma_wishlist_guest");
          }

          finalCart = cloudCart;
          finalWishlist = cloudWishlist;
        } else {
          // User is guest
          finalCart = guestCart;
          finalWishlist = guestWishlist;
        }

        // Hydrate
        try {
          finalCart = await hydrateCart(finalCart);
        } catch (hydErr) {
          console.warn("CartContext: Hydration error, using raw cart:", hydErr);
        }
      } catch (globalErr) {
        console.error("CartContext: Error during auth change sync:", globalErr);
        finalCart = guestCart;
        finalWishlist = guestWishlist;
      }

      setCart(finalCart);
      setWishlist(finalWishlist);
      setIsInitialized(true);
      prevUserRef.current = auth.currentUser;
    };

    handleAuthChange();
  }, [auth.currentUser]);

  // Sync to Cloud and LocalStorage whenever cart/wishlist change
  useEffect(() => {
    if (!isInitialized) return;

    const userCartKey = getCartKey(auth.currentUser?.uid);
    const userWishlistKey = getWishlistKey(auth.currentUser?.uid);

    localStorage.setItem(userCartKey, JSON.stringify(cart));
    localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));

    if (auth.currentUser) {
      // Persist to Cloud via secure REST endpoints
      const cartPointers = cart.map((item) => ({
        id: item.id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
        addedAt: item.addedAt || Date.now(),
      }));

      Promise.all([
        apiPost("/api/v1/auth/cart", { items: cartPointers }),
        apiPost("/api/v1/auth/wishlist", { items: wishlist }),
      ]).catch((err) => console.error("Error syncing cart/wishlist to cloud", err));
    }
  }, [cart, wishlist, isInitialized, auth.currentUser]);

  const addToCart = (productOrId: string | Product, sellerIdOrOptions?: string | Record<string, unknown>, options?: Record<string, unknown>) => {
    let productId: string;
    let sellerId: string;
    let actualOptions: Record<string, unknown> = {};
    let initialDetails: Partial<CartItem> = {};
    let productStock: number | undefined = undefined;

    if (productOrId && typeof productOrId === "object" && 'id' in productOrId) {
      productId = productOrId.id;
      sellerId = productOrId.sellerId || "";
      actualOptions = (sellerIdOrOptions as Record<string, unknown>) || {};
      productStock = (productOrId as Product).stock;
      initialDetails = {
        name: productOrId.name,
        price: productOrId.price,
        promoPrice: productOrId.promoPrice,
        image: productOrId.image || productOrId.images?.[0],
        variants: productOrId.variants,
      };
    } else {
      productId = productOrId as string;
      sellerId = (sellerIdOrOptions as string) || "";
      actualOptions = options || {};
    }

    const quantityToAdd = (actualOptions?.quantity as number) || 1;

    if (productStock !== undefined && productStock < quantityToAdd) {
      toast.error(`Stock insuffisant. Disponible : ${productStock}`);
      return;
    }
    setCart((prev) => {
      const quantityToAdd = (actualOptions?.quantity as number) || 1;
      const selectedVariant = (actualOptions?.selectedVariant as string) || null;

      const existingItemIndex = prev.findIndex((item) => {
        const v1 = item.selectedVariant || null;
        const v2 = selectedVariant || null;
        return item.id === productId && v1 === v2;
      });

      if (existingItemIndex !== -1) {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantityToAdd,
          addedAt: Date.now(),
        };
        return newCart;
      }

      const newItem: CartItem = {
        id: productId,
        sellerId: sellerId,
        name: initialDetails.name || "",
        price: initialDetails.price || 0,
        promoPrice: initialDetails.promoPrice,
        image: initialDetails.image || "",
        quantity: quantityToAdd,
        selectedVariant: selectedVariant || undefined,
        variants: initialDetails.variants,
        addedAt: Date.now(),
      };

      return [...prev, newItem];
    });

    const fetchLatestDetails = async () => {
      if (productDetailsCache.current[productId]) {
        const pData = productDetailsCache.current[productId];
        setCart((prev) =>
          prev.map((item) => {
            if (item.id === productId) {
              return {
                ...item,
                name: pData.name,
                price: pData.price,
                promoPrice: pData.promoPrice,
                image: pData.image || pData.images?.[0] || item.image,
                variants: pData.variants || item.variants,
              };
            }
            return item;
          })
        );
        return;
      }

      if (activeProductFetches.current[productId] !== undefined) {
        try {
          const pData = await activeProductFetches.current[productId];
          if (pData) {
            setCart((prev) =>
              prev.map((item) => {
                if (item.id === productId) {
                  return {
                    ...item,
                    name: pData.name,
                    price: pData.price,
                    promoPrice: pData.promoPrice,
                    image: pData.image || pData.images?.[0] || item.image,
                    variants: pData.variants || item.variants,
                  };
                }
                return item;
              })
            );
          }
        } catch (e) {
          console.warn("Deduplicated background fetch catch:", e);
        }
        return;
      }

      const fetchPromise = (async () => {
        try {
          const data = await apiGet<Product>(`/api/v1/products/${productId}`);
          if (data) {
            productDetailsCache.current[productId] = data;
            return data;
          }
        } catch (err) {
          console.error("Error fetching single product details", err);
        }
        return null;
      })();

      activeProductFetches.current[productId] = fetchPromise;

      try {
        const pData = await fetchPromise;
        if (pData) {
          setCart((prev) => {
            return prev.map((item) => {
              if (item.id === productId) {
                return {
                  ...item,
                  name: pData.name,
                  price: pData.price,
                  promoPrice: pData.promoPrice,
                  image: pData.image || pData.images?.[0] || item.image,
                  variants: pData.variants || item.variants,
                };
              }
              return item;
            });
          });
        }
      } catch (err) {
        console.warn("Background fetch of product details skipped:", err);
      } finally {
        delete activeProductFetches.current[productId];
      }
    };
    fetchLatestDetails();

    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const item = cart[index];
    if (item) {
      analyticsEngine.track("remove_from_cart", {
        productId: item.id,
        name: item.name,
        price: item.price,
      });
    }
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = (sellerId?: string) => {
    if (sellerId) {
      setCart((prev) => prev.filter((item) => item.sellerId !== sellerId));
    } else {
      setCart([]);
    }
  };

  const updateQuantity = (index: number, qty: number) => {
    const MAX_QTY = 99;
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    if (qty > MAX_QTY) {
      toast.error(`Quantité maximum : ${MAX_QTY}`);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: qty };
      }
      return next;
    });
  };

  const revalidateCart = async () => {
    const updated = await hydrateCart(cart);
    setCart(updated);
  };

  const getCartItemPrice = (item: CartItem) => {
    let targetPrice = item.promoPrice !== undefined && item.promoPrice !== null
      ? item.promoPrice
      : item.price;

    if (item.selectedVariant && item.variants && Array.isArray(item.variants)) {
      const variant = item.variants.find((v) => v.name === item.selectedVariant);
      if (variant) {
        if (variant.priceOverride !== undefined && variant.priceOverride !== null && variant.priceOverride !== "") {
          targetPrice = Number(variant.priceOverride) || 0;
        } else if (variant.priceDiff) {
          targetPrice += Number(variant.priceDiff) || 0;
        }
      }
    }
    return isNaN(targetPrice) ? 0 : targetPrice;
  };

  const totalPrice = cart.reduce((sum, item) => sum + getCartItemPrice(item) * (item.quantity || 1), 0);

  const toggleWishlist = (id: string) => {
    const isAdding = !wishlist.includes(id);
    analyticsEngine.track("wishlist_toggle", {
      productId: id,
      action: isAdding ? "add" : "remove",
    });
    setWishlist((prev) => (prev.includes(id) ? prev.filter((wishId) => wishId !== id) : [...prev, id]));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        revalidateCart,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
        getCartItemPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
