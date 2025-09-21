import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

export function useAuthStateCompat() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => { setUser(u); setLoading(false); },
      (e) => { setError(e ); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return [user, loading, error] as const;
}
