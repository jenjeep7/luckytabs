import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyDlEyji-FTgF55W3bCRRGxafFlRLy_hOPY",
  authDomain: "pull-tabs.firebaseapp.com",
  projectId: "pull-tabs",
  storageBucket: "pull-tabs.firebasestorage.app",
  messagingSenderId: "769021961982",
  appId: "1:769021961982:web:b49441628decbf263067af",
  measurementId: "G-90K1GE6Y03"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
