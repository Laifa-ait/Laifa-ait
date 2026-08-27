import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { UserProfile } from "../domains/user/user.types";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";



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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      } else {
        // Guarantee loading clears within 1.5s even if api sync is slow
        const safetyTimer = setTimeout(() => setLoading(false), 1500);

        // Sync & Fetch initial profile
        try {
          const data = await apiPost<{ success: boolean; profile: UserProfile }>("/api/v1/auth/sync", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastAuthMethod: "auto_sync"
          });
          if (data?.success && data?.profile) {
            setUserProfile(data.profile);
          }
        } catch (err) {
          safeLogger.warn("AuthContext: Sync retry finished on initial load", { err: err instanceof Error ? err.message : String(err) });
        } finally {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Poll for profile updates every 60s as a direct replacement for onSnapshot
  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const data = await apiGet<UserProfile>("/api/v1/auth/profile");
        if (data) {
          setUserProfile(data);
        }
      } catch (err) {
        safeLogger.warn("AuthContext: Periodic profile fetch retry finished", { err: err instanceof Error ? err.message : String(err) });
      }
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);



  const signInWithGoogle = async (role?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const data = await apiPost<{ success: boolean; profile: UserProfile }>("/api/v1/auth/sync", {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: role || "buyer",
        lastAuthMethod: "google"
      });
      if (data?.success && data?.profile) {
        setUserProfile(data.profile);
      }
    } catch (err: unknown) {
      const errCode = (err && typeof err === "object" && "code" in err) ? String((err as { code: unknown }).code) : undefined;
      if (errCode === "auth/popup-blocked") {
        toast.error("Veuillez autoriser les popups pour vous connecter avec Google");
      } else if (errCode === "auth/network-request-failed") {
        toast.error("Erreur réseau. Vérifiez votre connexion.");
      } else {
        toast.error("Erreur de connexion Google");
      }
      safeLogger.error("Google sign-in error", { err: err instanceof Error ? err.message : String(err) });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    if (user.emailVerified) {
      const pendingRole = localStorage.getItem("olmart_pending_registration_role") || "buyer";
      const data = await apiPost<{ success: boolean; profile: UserProfile }>("/api/v1/auth/sync", {
        displayName: user.displayName || email.split("@")[0],
        email: user.email,
        role: pendingRole,
        lastAuthMethod: "email"
      });
      localStorage.removeItem("olmart_pending_registration_role");
      if (data?.success && data?.profile) {
        setUserProfile(data.profile);
      }
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
      lastAuthMethod: "email"
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
      safeLogger.warn("AuthContext: Received auth:unauthorized event, logging out");
      await logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
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
