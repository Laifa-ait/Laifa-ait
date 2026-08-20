export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ARTISAN: 'artisan',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
