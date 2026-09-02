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
  profile: { displayName?: string; photoURL?: string }
): Promise<void> {
  await fbUpdateProfile(user, profile);
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
