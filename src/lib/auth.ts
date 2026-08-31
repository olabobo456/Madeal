import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

/**
 * Opens the Google sign-in popup. The resulting user's `uid` becomes the
 * creatorId used everywhere else in the app (Firestore documents, storage
 * keys, security rules) so each creator only ever sees their own data.
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutCreator(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to auth state. Fires immediately with the current user
 * (or null) and again on every sign-in/sign-out.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
