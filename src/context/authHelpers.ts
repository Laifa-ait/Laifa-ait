import { User as FirebaseUser } from "firebase/auth";
import { UserProfile, UserRole } from "../domains/user/user.types";
import { apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";

export const createBaselineProfile = (
  user: FirebaseUser,
  role: UserRole = "buyer"
): UserProfile => ({
  uid: user.uid,
  displayName: user.displayName || user.email?.split("@")[0] || "Utilisateur",
  email: user.email || "",
  photoURL: user.photoURL || "",
  role,
  status: "active",
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
} as UserProfile);

export const syncUserProfileWithBackend = async (
  user: FirebaseUser,
  role?: string,
  lastAuthMethod: string = "auto_sync"
): Promise<UserProfile | null> => {
  try {
    const data = await apiPost<{ success: boolean; profile: UserProfile }>("/api/v1/auth/sync", {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: role || "buyer",
      lastAuthMethod,
    });
    if (data?.success && data?.profile) {
      return data.profile;
    }
  } catch (err) {
    safeLogger.warn("authHelpers: Backend profile sync retry finished", {
      err: err instanceof Error ? err.message : String(err),
    });
  }
  return null;
};
