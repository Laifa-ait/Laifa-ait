import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from "../domains/product/product.types";

export interface ComparatorState {
  products: Product[];
  pinnedProductId: string | null;
  showOnlyDifferences: boolean;
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: string) => void;
  toggleProduct: (product: Product) => void;
  clear: () => void;
  isProductCompared: (productId: string) => boolean;
  setPinnedProduct: (productId: string | null) => void;
  setShowOnlyDifferences: (show: boolean) => void;
}

const MAX_COMPARATOR_ITEMS = 4;

export const useComparatorStore = create<ComparatorState>()(
  persist(
    (set, get) => ({
      products: [],
      pinnedProductId: null,
      showOnlyDifferences: false,
      
      addProduct: (product: Product) => {
        const { products } = get();
        if (products.length >= MAX_COMPARATOR_ITEMS) return false;
        if (!products.some((p) => p.id === product.id)) {
          set({ products: [...products, product] });
          return true;
        }
        return false;
      },

      removeProduct: (productId: string) => {
        set((state) => {
          const updated = state.products.filter((p) => p.id !== productId);
          return {
            products: updated,
            pinnedProductId: state.pinnedProductId === productId ? null : state.pinnedProductId,
          };
        });
      },

      toggleProduct: (product: Product) => {
        const { products, addProduct, removeProduct } = get();
        const exists = products.some((p) => p.id === product.id);
        if (exists) {
          removeProduct(product.id);
        } else {
          addProduct(product);
        }
      },

      clear: () => set({ products: [], pinnedProductId: null, showOnlyDifferences: false }),

      isProductCompared: (productId: string) => {
        return get().products.some((p) => p.id === productId);
      },

      setPinnedProduct: (productId: string | null) => {
        set({ pinnedProductId: productId });
      },

      setShowOnlyDifferences: (show: boolean) => {
        set({ showOnlyDifferences: show });
      },
    }),
    { name: 'olma-comparator-v2' }
  )
);

// Selectors for fine-grained re-render optimization
export const useComparatorProducts = () => useComparatorStore((state) => state.products);
export const useComparatorCount = () => useComparatorStore((state) => state.products.length);
export const useComparatorActions = () =>
  useComparatorStore((state) => ({
    addProduct: state.addProduct,
    removeProduct: state.removeProduct,
    toggleProduct: state.toggleProduct,
    clear: state.clear,
    isProductCompared: state.isProductCompared,
    setPinnedProduct: state.setPinnedProduct,
    setShowOnlyDifferences: state.setShowOnlyDifferences,
  }));
