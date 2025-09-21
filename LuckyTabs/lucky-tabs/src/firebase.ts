import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, Analytics } from "firebase/analytics";
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBn9ZEOC5RqOoeHMPBgaL42Y98fK9UNh4w",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "pull-tabs.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "pull-tabs",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "pull-tabs.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "769021961982",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:769021961982:web:b49441628decbf263067af",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-90K1GE6Y03"
};


const app = initializeApp(firebaseConfig);
console.log('[firebase.ts] Firebase app initialized:', app.name);

// Only initialize analytics on web (not native/Capacitor)
let analytics: Analytics | undefined;
if (!Capacitor.isNativePlatform()) {
  analytics = getAnalytics(app);
}

// Use initializeAuth for hybrid (Capacitor) compatibility
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});
console.log('[firebase.ts] Auth instance created:', auth);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1'); // Specify region
export { analytics };
