/**
 * Centralized Query Keys factory for TanStack React Query.
 * All query keys across the application MUST be declared here.
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, unknown>) => ['products', 'list', filters || {}] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    category: (category: string, limit?: number) => ['products', 'category', category, limit ?? 20] as const,
    featured: (limit?: number, offset?: number) => ['products', 'featured', { limit, offset }] as const,
    flashSales: (limit?: number) => ['products', 'flashSales', limit] as const,
    tag: (tagId: string) => ['products', 'tag', tagId] as const,
    collection: (name: string) => ['products', 'collection', name] as const,
    reviews: (productId: string) => ['products', 'reviews', productId] as const,
  },
  home: {
    all: ['home'] as const,
    data: () => ['home', 'data'] as const,
  },
  admin: {
    all: ['admin'] as const,
    categories: () => ['admin', 'categories'] as const,
  },
  settings: {
    all: ['settings'] as const,
    global: () => ['settings', 'global'] as const,
    shipping: () => ['settings', 'shipping'] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  shop: {
    all: ['shop'] as const,
    detail: (slugOrId: string) => ['shop', 'detail', slugOrId] as const,
  },
  campaign: {
    banner: (id: string) => ['campaign', 'banner', id] as const,
  },
} as const;
