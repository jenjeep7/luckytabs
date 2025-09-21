/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { useAuthStateCompat } from './services/useAuthStateCompat';

const AuthDebug: React.FC = () => {
  const [user, loading, error] = useAuthStateCompat();

  return (
    <div style={{ padding: 24, fontSize: 18 }}>
      <div><b>AuthDebug Component</b></div>
      <div>user: {user ? JSON.stringify(user) : 'null'}</div>
      <div>loading: {String(loading)}</div>
      <div>error: {error?.message || 'none'}</div>
    </div>
  );
};

export default AuthDebug;
