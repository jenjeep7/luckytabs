import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { signInWithEmailAndPassword, signOut as webSignOut, User } from 'firebase/auth';
import { auth } from '../firebase';

// Platform check
const isNative = Capacitor.isNativePlatform();

// --- Auth State Listener ---
export function onAuthStateChangedCompat(callback: (user: User | null) => void) {
  if (isNative) {
    const unsubPromise = FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
      if (user) {
        // Map native user to a User-like object if needed
        callback({
          ...user,
          providerId: user.providerId || 'firebase',
          isAnonymous: false,
          refreshToken: '',
          metadata: {},
          tenantId: null,
        } as unknown as User);
      } else {
        callback(null);
      }
    });
    return async () => {
      const sub = await unsubPromise;
      void sub.remove();
    };
  } else {
    return auth ? auth.onAuthStateChanged(callback) : undefined;
  }
}

// --- Sign In ---
export async function signInWithEmailPasswordCompat(email: string, password: string) {
  if (isNative) {
    const { user } = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
    return user;
  }
  if (!auth) throw new Error('Firebase Auth is not initialized on web');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// --- Google Sign In ---
export async function signInWithGoogleCompat() {
  if (isNative) {
    const { user } = await FirebaseAuthentication.signInWithGoogle();
    return user;
  }
  if (!auth) throw new Error('Firebase Auth is not initialized on web');
  const provider = new (await import('firebase/auth')).GoogleAuthProvider();
  const result = await (await import('firebase/auth')).signInWithPopup(auth, provider);
  return result.user;
}

// --- Sign Out ---
export async function signOutCompat() {
  if (isNative) {
    await FirebaseAuthentication.signOut();
  } else if (auth) {
    await webSignOut(auth);
  }
}
