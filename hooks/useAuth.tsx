import React, { useState, createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { signInWithBase } from '../services/baseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean | null; // Add this to track if user is new
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      const { user: userData, isNewUser: newUserFlag } = await signInWithBase();
      setUser(userData);
      setIsNewUser(newUserFlag);
      
      // Optional: You can trigger some onboarding flow here if isNewUser is true
      if (newUserFlag) {
        console.log('New user detected! Consider showing onboarding flow.');
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      setUser(null);
      setIsNewUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setIsNewUser(null);
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    isNewUser, 
    signIn, 
    signOut 
  }), [user, loading, isNewUser, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};