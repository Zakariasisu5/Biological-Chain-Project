import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Use environment variables for Firebase config. Populate .env with your Firebase project values:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
// VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : (process.env as any);

// Provided Firebase config (falls back to Vite env vars if present)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBzZDvLUC9B29wLjw09H9ksiNR428t5ShQ',
  authDomain: 'biologic-chain.firebaseapp.com',
  projectId: 'biologic-chain',
  storageBucket: 'biologic-chain.firebasestorage.app',
  messagingSenderId: '1011699252356',
  appId: '1:1011699252356:web:fd7f30a156057f8f1d96d1',
  measurementId: 'G-RYWCDQ6N1C',
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

export function initFirebase() {
  if (app) return { app, auth };
  app = initializeApp(firebaseConfig);
  try { auth = getAuth(app); } catch (e) { auth = null; }
  try { db = getFirestore(app); } catch (e) { db = null; }
  try { storage = getStorage(app); } catch (e) { storage = null; }
  try { analytics = (firebaseConfig.measurementId ? getAnalytics(app) : null) as Analytics | null; } catch (e) { analytics = null; }
  return { app, auth, db, storage, analytics };
}

export function getAuthClient(): Auth | null {
  if (!auth) {
    try { initFirebase(); } catch (e) { return null; }
  }
  return auth;
}

export function getFirestoreClient(): Firestore | null {
  if (!db) {
    try { initFirebase(); } catch (e) { return null; }
  }
  return db;
}

export function getStorageClient(): FirebaseStorage | null {
  if (!storage) {
    try { initFirebase(); } catch (e) { return null; }
  }
  return storage;
}

export function getAnalyticsClient(): Analytics | null {
  if (!analytics) {
    try { initFirebase(); } catch (e) { return null; }
  }
  return analytics;
}
