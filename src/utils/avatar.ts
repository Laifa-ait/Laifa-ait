/**
 * OLMART Premium Modern Vector Avatars
 * Clean, lightweight, and offline-ready static SVG paths.
 * URLs are ultra-short (~20 chars) to prevent Firebase Auth "Photo URL too long" errors.
 */

export const RETRO_AVATARS: string[] = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
  "/avatars/avatar-6.svg",
  "/avatars/avatar-7.svg",
  "/avatars/avatar-8.svg",
];

// Deterministic fallback avatar generator
export function getRetroAvatar(seedOrEmail?: string): string {
  if (!seedOrEmail) return RETRO_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < seedOrEmail.length; i++) {
    hash = seedOrEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % RETRO_AVATARS.length;
  return RETRO_AVATARS[index];
}
