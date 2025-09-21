import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStateCompat } from '../services/useAuthStateCompat';
import { userService } from '../services/userService';
import { setUserAnalyticsProperties } from '../utils/analytics';

export type UserProfile = {
  plan?: string;
  // ...other fields as needed
};

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser] = useAuthStateCompat();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (firebaseUser?.uid) {
      setLoading(true);
      const profile = await userService.getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
      
      // Set analytics user properties when profile is loaded
      if (profile) {
        setUserAnalyticsProperties({
          userId: firebaseUser.uid,
          plan: profile.plan || 'free',
          signupDate: firebaseUser.metadata.creationTime || ''
        });
      }
      
      setLoading(false);
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
    // eslint-disable-next-line
  }, [firebaseUser]);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, refreshProfile: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
