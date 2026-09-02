import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with forced long-polling to guarantee immediate connectivity in iframe and sandboxed environments
let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || '(default)'
  );
} catch {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

export { app, db };
export const functions = getFunctions(app);
