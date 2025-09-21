import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChangedCompat } from './authService';

type UnsubType = (() => void) | Promise<{ remove: () => void }> | undefined;

export function useAuthUserCompat() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub: UnsubType = onAuthStateChangedCompat((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      if (!unsub) {
        // No cleanup needed if unsub is undefined
        return;
      } else if (typeof unsub === 'function') {
        unsub();
      } else if (unsub && typeof (unsub as Promise<unknown>).then === 'function') {
        void (unsub as Promise<{ remove: () => void }>).
          then((remover) => remover && remover.remove());
      }
    };
  }, []);

  return [user, loading] as const;
}
