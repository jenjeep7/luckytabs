import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";

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

// Initialize analytics (unused in dev but needed for production)
void getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1'); // Specify region
