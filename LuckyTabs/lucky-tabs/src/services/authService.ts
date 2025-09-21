import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { signInWithEmailAndPassword, signOut as webSignOut, User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Platform check
const isNative = Capacitor.isNativePlatform();

// --- Auth State Listener ---
export function onAuthStateChangedCompat(callback: (user: User | null) => void) {
  // console.log('[authService] onAuthStateChangedCompat called. isNative:', isNative);
  if (isNative) {
    console.log('[authService] Registering native authStateChange listener');
    const unsubPromise = FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
      try {
        console.log('[authService] Native authStateChange:', user);
        if (user) {
          const mappedUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber || null,
            photoURL: user.photoUrl || null,
            providerId: user.providerId || 'firebase',
            isAnonymous: false,
            refreshToken: '',
            metadata: {},
            tenantId: null,
          } as unknown as User;
          callback(mappedUser);
        } else {
          callback(null);
        }
      } catch (err) {
        console.error('[authService] Error in native authStateChange callback:', err, user);
        callback(null);
      }
    });
    // Return unsubscribe
    return async () => {
      const sub = await unsubPromise;
      void sub.remove();
    };
  } else {
    // Web: use Firebase JS SDK
    return onAuthStateChanged(auth, callback);
  }
}

// --- Sign In ---
export async function signInWithEmailPasswordCompat(email: string, password: string) {
  if (isNative) {
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
    return result.user;
  } else {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }
}

// --- Google Sign In ---
export async function signInWithGoogleCompat() {
  if (isNative) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    return result.user;
  } else {
    // Web: use popup
    const provider = new (await import('firebase/auth')).GoogleAuthProvider();
    const result = await (await import('firebase/auth')).signInWithPopup(auth, provider);
    return result.user;
  }
}

// --- Sign Out ---
export async function signOutCompat() {
  if (isNative) {
    await FirebaseAuthentication.signOut();
  } else {
    await webSignOut(auth);
  }
}

// --- Get Current User ---
export function getCurrentUserCompat(): User | null {
  if (isNative) {
    // Not always available, so rely on authStateChange
    return null;
  } else {
    return auth.currentUser;
  }
}
