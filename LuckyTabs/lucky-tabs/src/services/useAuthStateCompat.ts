import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, syncNativeAuthWithFirestore } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export function useAuthStateCompat() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (process.env.NODE_ENV === 'development') {
    console.log('[useAuthStateCompat] Initializing, isNative:', isNative);
    }
    
    let unsub: (() => void) | undefined;
    
    if (isNative) {
      let removed = false;
      
      // Check current user immediately on native
      const checkCurrentUser = async () => {
        try {
          const result = await FirebaseAuthentication.getCurrentUser();
          if (process.env.NODE_ENV === 'development') {
          console.log('[useAuthStateCompat] Current user check result:', result);
          }
          if (result && result.user) {
            const userObj = {
              ...result.user,
              providerId: result.user.providerId || 'firebase',
              isAnonymous: false,
              refreshToken: '',
              metadata: {},
              tenantId: null,
            } as unknown as User;
            
            setUser(userObj);
            
            // Sync with Firestore auth context
            try {
              await syncNativeAuthWithFirestore();
            } catch (error) {
              console.error('[useAuthStateCompat] Failed to sync auth:', error);
              // Continue anyway - user is still authenticated
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
          console.log('[useAuthStateCompat] Error checking current user:', err);
          }
          setUser(null);
          setLoading(false);
        }
      };
      
      // Check immediately
      void checkCurrentUser();
      
      // Also listen for changes
      const listenerPromise = FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
        if (process.env.NODE_ENV === 'development') {
        console.log('[useAuthStateCompat] Auth state change:', user);
        }
        if (user) {
          const userObj = {
            ...user,
            providerId: user.providerId || 'firebase',
            isAnonymous: false,
            refreshToken: '',
            metadata: {},
            tenantId: null,
          } as unknown as User;
          
          setUser(userObj);
          
          // Sync with Firestore auth context (don't await to avoid blocking)
          void syncNativeAuthWithFirestore();
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      
      unsub = () => {
        if (!removed) {
          void listenerPromise.then(sub => sub.remove());
          removed = true;
        }
      };
    } else {
      const unsubscribe = auth ? onAuthStateChanged(
        auth,
        (u) => { 
          if (process.env.NODE_ENV === 'development') {
          console.log('[useAuthStateCompat] Web auth state change:', u?.uid || 'no user');
          }
          setUser(u); 
          setLoading(false); 
        },
        (e) => { 
          if (process.env.NODE_ENV === 'development') {
          console.log('[useAuthStateCompat] Web auth error:', e);
          }
          setError(e); 
          setLoading(false); 
        }
      ) : undefined;
      unsub = unsubscribe || undefined;
    }
    return () => { if (unsub) unsub(); };
  }, []);

  return [user, loading, error] as const;
}
