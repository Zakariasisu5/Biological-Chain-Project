
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  walletAddress: any;
  id: string;
  email: string;
  name: string;
  plan?: 'Basic' | 'Premium' | 'Enterprise';
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // For demo purposes, we're using local storage
  // In a real app, this would connect to a backend
  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo login logic
        if (email && password.length >= 6) {
          // Demo user
          const user: User = {
            id: '1',
            email,
            name: email.split('@')[0],
            plan: 'Premium'
          };
          
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    // Simulate API call
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo register logic
        if (name && email && password.length >= 6) {
          // Demo user
          const user: User = {
            id: Date.now().toString(),
            email,
            name,
            plan: 'Basic'
          };
          
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid registration data'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
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
