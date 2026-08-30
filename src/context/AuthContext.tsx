import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { UserProfile } from "../domains/user/user.types";
import { apiGet, apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";
import { createBaselineProfile, syncUserProfileWithBackend } from "./authHelpers";

interface AuthContextType {
  user: UserProfile | null;
  openAuthModal?: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result for mobile / fallback OAuth flows
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          const pendingRole = localStorage.getItem("olmart_pending_registration_role") || "buyer";
          const profile = await syncUserProfileWithBackend(user, pendingRole, "google_redirect");
          localStorage.removeItem("olmart_pending_registration_role");
          if (profile) {
            setUserProfile(profile);
          }
        }
      })
      .catch((err) => {
        safeLogger.warn("AuthContext: getRedirectResult warning", {
          err: err instanceof Error ? err.message : String(err),
        });
      });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      } else {
        // Hydrate immediate baseline profile to prevent guest UI flicker
        setUserProfile((prev) => prev || createBaselineProfile(user));

        const safetyTimer = setTimeout(() => setLoading(false), 1500);

        try {
          const profile = await syncUserProfileWithBackend(user, undefined, "auto_sync");
          if (profile) {
            setUserProfile(profile);
          }
        } finally {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Poll for profile updates every 60s
  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const data = await apiGet<UserProfile>("/api/v1/auth/profile");
        if (data) {
          setUserProfile(data);
        }
      } catch (err) {
        safeLogger.warn("AuthContext: Periodic profile fetch retry finished", {
          err: err instanceof Error ? err.message : String(err),
        });
      }
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const signInWithGoogle = async (role?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (role) {
        try {
          localStorage.setItem("olmart_pending_registration_role", role);
        } catch { /* ignore */ }
      }

      const isMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      let user: FirebaseUser | null = null;
      try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (popupErr: unknown) {
        const code = (popupErr && typeof popupErr === "object" && "code" in popupErr) ? String((popupErr as { code: unknown }).code) : "";
        if (isMobile && (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user")) {
          safeLogger.info("AuthContext: Mobile popup blocked/dismissed, switching to redirect flow");
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      if (user) {
        setCurrentUser(user);
        setUserProfile(createBaselineProfile(user, (role as "buyer" | "seller" | "admin" | "artisan" | "property_owner") || "buyer"));

        const profile = await syncUserProfileWithBackend(user, role, "google");
        if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (err: unknown) {
      safeLogger.error("Google sign-in error", { err: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    setCurrentUser(user);

    const pendingRole = localStorage.getItem("olmart_pending_registration_role") || "buyer";
    setUserProfile(createBaselineProfile(user, (pendingRole as "buyer" | "seller" | "admin" | "artisan" | "property_owner") || "buyer"));

    const profile = await syncUserProfileWithBackend(user, pendingRole, "email");
    localStorage.removeItem("olmart_pending_registration_role");
    if (profile) {
      setUserProfile(profile);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    const userRole = role || "buyer";

    await updateProfile(user, { displayName: name });
    await apiPost("/api/v1/auth/sync", {
      displayName: name,
      email: email,
      role: userRole,
      lastAuthMethod: "email",
    });
    await sendEmailVerification(user);

    try {
      localStorage.setItem("olmart_pending_registration_role", userRole);
    } catch { /* ignore */ }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const handleUnauthorized = async () => {
      safeLogger.warn("AuthContext: Received auth:unauthorized event");
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch {
          await logout();
        }
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      userProfile,
      user: userProfile,
      openAuthModal: () => { window.dispatchEvent(new Event("auth:openModal")); },
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
    }),
    [currentUser, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    safeLogger.warn("useAuth used outside AuthProvider");
    return { currentUser: null, userProfile: null, loading: false } as unknown as AuthContextType;
  }
  return context;
};
