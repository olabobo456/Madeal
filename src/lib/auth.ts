import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

let isSigningIn = false;

export async function signInWithGoogle(): Promise<User | null> {
  if (isSigningIn) {
    return null;
  }
  isSigningIn = true;

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    const code = error?.code;
    const msg = error?.message || '';

    // Handle common cancellation and popup closure without throwing unhandled internal errors
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('Pending promise was never set') ||
      msg.includes('popup-closed-by-user')
    ) {
      console.info('Google sign-in popup was dismissed by user.');
      return null;
    }

    if (code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please allow popups for this site.');
    }

    console.error('Firebase Auth sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return userCredential.user;
  } catch (error: any) {
    const code = error?.code;
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your details and try again.');
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later or reset your password.');
    }
    throw new Error(error?.message || 'Failed to sign in. Please try again.');
  }
}

export async function signUpWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && displayName.trim()) {
      await updateProfile(userCredential.user, { displayName: displayName.trim() });
    }
    return userCredential.user;
  } catch (error: any) {
    const code = error?.code;
    if (code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    if (code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(error?.message || 'Failed to create account. Please try again.');
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    const code = error?.code;
    if (code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    }
    if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(error?.message || 'Failed to send password reset email.');
  }
}

export async function signOutCreator(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(
    auth,
    callback,
    (error) => {
      console.warn('Auth state change listener encountered an error:', error);
    }
  );
}
