import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const AuthDebug: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 24, fontSize: 18 }}>
      <div><b>AuthDebug Component</b></div>
      <div>user: {user ? JSON.stringify(user) : 'null'}</div>
      <div>loading: {String(loading)}</div>
      <div>error: {error || 'none'}</div>
    </div>
  );
};

export default AuthDebug;
