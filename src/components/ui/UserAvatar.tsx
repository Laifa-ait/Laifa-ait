import React, { useState, useMemo } from "react";

export interface UserAvatarProps {
  photoURL?: string | null;
  fallbackPhotoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  providerData?: Array<{ photoURL?: string | null; providerId?: string }>;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showOnlineBadge?: boolean;
  role?: string;
  alt?: string;
}

const SIZE_MAP: Record<string, { container: string; text: string; badge: string; px: number }> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", badge: "w-2 h-2", px: 24 },
  sm: { container: "w-8 h-8", text: "text-xs", badge: "w-2.5 h-2.5", px: 32 },
  md: { container: "w-10 h-10", text: "text-sm", badge: "w-3 h-3", px: 40 },
  lg: { container: "w-12 h-12", text: "text-base", badge: "w-3.5 h-3.5", px: 48 },
  xl: { container: "w-14 h-14", text: "text-lg", badge: "w-4 h-4", px: 56 },
};

const GRADIENTS = [
  "from-[#0088A8] to-[#005B73]",
  "from-[#2563EB] to-[#1D4ED8]",
  "from-[#059669] to-[#047857]",
  "from-[#7C3AED] to-[#6D28D9]",
  "from-[#DB2777] to-[#BE185D]",
  "from-[#D97706] to-[#B45309]",
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim() && name.trim() !== "Utilisateur") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.includes("@")) {
    const prefix = email.split("@")[0].replace(/[._-]/g, " ").trim();
    const parts = prefix.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return prefix.slice(0, 2).toUpperCase();
  }
  return "OL";
}

function getGradient(seed?: string | null): string {
  if (!seed) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  fallbackPhotoURL,
  displayName,
  email,
  providerData,
  size = "md",
  className = "",
  showOnlineBadge = false,
  role,
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine candidate photoURL: prefer explicit external URLs (Google / Cloud Storage / CDN)
  const resolvedPhoto = useMemo(() => {
    const candidates = [
      photoURL,
      ...(providerData?.map((p) => p.photoURL) || []),
      fallbackPhotoURL,
    ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);

    // 1. Look for a valid HTTP / HTTPS photo (e.g. Google photo, Cloud Storage)
    const httpPhoto = candidates.find(
      (url) => url.startsWith("http://") || url.startsWith("https://")
    );
    if (httpPhoto) return httpPhoto;

    // 2. If no HTTP photo, check if there's any non-empty candidate (e.g. /avatars/avatar-1.svg)
    if (candidates.length > 0) {
      return candidates[0];
    }
    return null;
  }, [photoURL, providerData, fallbackPhotoURL]);

  const initials = useMemo(() => getInitials(displayName, email), [displayName, email]);
  const gradient = useMemo(() => getGradient(email || displayName || "olmart"), [email, displayName]);

  const sizeConfig = typeof size === "string" ? SIZE_MAP[size] || SIZE_MAP.md : SIZE_MAP.md;
  const customDimensions = typeof size === "number" ? { width: size, height: size } : undefined;

  const showPhoto = Boolean(resolvedPhoto && !imageError);

  return (
    <div
      style={customDimensions}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${
        typeof size === "string" ? sizeConfig.container : ""
      } ${className}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white/90 shadow-xs bg-zinc-100">
        {showPhoto ? (
          <img
            src={resolvedPhoto!}
            alt={alt || displayName || "Avatar"}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold tracking-wider ${sizeConfig.text}`}
          >
            <span>{initials}</span>
          </div>
        )}
      </div>

      {showOnlineBadge && (
        <span
          className={`absolute bottom-0 right-0 ${sizeConfig.badge} rounded-full ring-2 ring-white ${
            role === "admin"
              ? "bg-rose-500"
              : role === "seller"
              ? "bg-indigo-500"
              : "bg-emerald-500"
          }`}
          title={role === "admin" ? "Administrateur" : role === "seller" ? "Vendeur Pro" : "En ligne"}
        />
      )}
    </div>
  );
};
