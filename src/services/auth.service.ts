import {
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification,
  reload as fbReload,
  updateProfile as fbUpdateProfile,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential as fbReauthenticateWithCredential,
  updatePassword as fbUpdatePassword,
  verifyBeforeUpdateEmail as fbVerifyBeforeUpdateEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../lib/firebase";

export async function sendPasswordReset(email: string): Promise<void> {
  await fbSendPasswordResetEmail(auth, email);
}

export async function verifyUserEmail(user: FirebaseUser): Promise<void> {
  await fbSendEmailVerification(user);
}

export async function reloadUser(user: FirebaseUser): Promise<void> {
  await fbReload(user);
}

export async function updateUserProfile(
  user: FirebaseUser,
  profile: { displayName?: string; photoURL?: string | null }
): Promise<void> {
  const sanitizedProfile: { displayName?: string; photoURL?: string | null } = {};
  if (profile.displayName !== undefined) {
    sanitizedProfile.displayName = profile.displayName.trim();
  }

  // Firebase Auth enforces strict constraints on photoURL:
  // Must not be an oversized string (reject data URIs or strings > 500 chars),
  // and must be a valid URL format or null/empty.
  if (profile.photoURL !== undefined) {
    const raw = profile.photoURL;
    if (!raw || raw.trim() === "") {
      sanitizedProfile.photoURL = null;
    } else if (raw.startsWith("data:") || raw.length > 500) {
      // Legacy oversized base64/data URIs fail Firebase Auth attribute validation.
      // Fallback to safe static SVG avatar.
      sanitizedProfile.photoURL = "/avatars/avatar-1.svg";
    } else {
      sanitizedProfile.photoURL = raw;
    }
  }

  try {
    await fbUpdateProfile(user, sanitizedProfile);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    // If Firebase Auth rejects the photoURL attribute (e.g. invalid attribute format or URL length),
    // fallback gracefully to null so the user's name/profile update succeeds without failure.
    if (
      errMsg.includes("invalid-profile-attribute") ||
      errMsg.includes("Photo URL") ||
      errMsg.includes("photoURL") ||
      errMsg.includes("auth/invalid-profile-attribute")
    ) {
      await fbUpdateProfile(user, {
        displayName: sanitizedProfile.displayName,
        photoURL: null,
      });
    } else {
      throw err;
    }
  }
}

export async function createEmailUser(email: string, pass: string): Promise<{ user: FirebaseUser }> {
  const cred = await fbCreateUserWithEmailAndPassword(auth, email, pass);
  return { user: cred.user };
}

export async function reauthenticateUser(user: FirebaseUser, pass: string): Promise<void> {
  if (!user.email) throw new Error("Email non disponible");
  const cred = EmailAuthProvider.credential(user.email, pass);
  await fbReauthenticateWithCredential(user, cred);
}

export async function updateUserPassword(user: FirebaseUser, newPass: string): Promise<void> {
  await fbUpdatePassword(user, newPass);
}

export async function verifyAndUpdateUserEmail(user: FirebaseUser, newEmail: string): Promise<void> {
  await fbVerifyBeforeUpdateEmail(user, newEmail);
}

export function getCurrentAuthUser(): FirebaseUser | null {
  return auth.currentUser;
}
