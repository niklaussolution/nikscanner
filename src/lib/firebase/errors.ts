import type { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.",
  "auth/unauthorized-domain":
    "Google sign-in isn't enabled for this website address yet. Add this domain under Firebase Console → Authentication → Settings → Authorized domains.",
  "auth/operation-not-allowed": "Google sign-in is disabled. Enable it under Firebase Console → Authentication → Sign-in method.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method. Log in with email and password instead.",
  "auth/internal-error": "Google sign-in failed to start. Check that pop-ups are allowed and try again.",
};

export function firebaseAuthErrorMessage(error: unknown): string {
  const code = (error as FirebaseError | undefined)?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  // Unmapped codes still get logged, so a misconfiguration isn't hidden behind the generic text.
  console.error("[auth]", code ?? error);
  return code ? `Something went wrong (${code}). Please try again.` : "Something went wrong. Please try again.";
}
