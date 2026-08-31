import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with auto long-polling detection to guarantee connectivity in all preview and iframe environments
let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || '(default)'
  );
} catch {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

export { app, db };
export const functions = getFunctions(app);
