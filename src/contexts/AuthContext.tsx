
import React, { createContext, useState, useContext, useEffect } from 'react';
import { initFirebase, getAuthClient } from '@/integrations/firebase/client';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

type User = {
  id: string;
  email: string;
  name: string | null;
  walletAddress?: string | null;
  plan?: 'Basic' | 'Premium' | 'Enterprise';
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize firebase
    try { initFirebase(); } catch (e) { /* ignore */ }
    const auth = getAuthClient();
    if (!auth) { setLoading(false); return; }

    const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const u: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || null,
          walletAddress: null,
        };
        setCurrentUser(u);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => { try { unsub(); } catch (e) {} };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const auth = getAuthClient();
      if (!auth) throw new Error('Firebase auth not initialized');
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const auth = getAuthClient();
      if (!auth) throw new Error('Firebase auth not initialized');
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Optionally update display name via updateProfile if needed
      // import { updateProfile } from 'firebase/auth' and call updateProfile(userCred.user, { displayName: name })
      // For simplicity we set currentUser here after register
      setCurrentUser({ id: userCred.user.uid, email: userCred.user.email || '', name, walletAddress: null, plan: 'Basic' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const auth = getAuthClient();
      if (!auth) throw new Error('Firebase auth not initialized');
      await signOut(auth);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
