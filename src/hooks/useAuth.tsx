// frontend/src/hooks/useAuth.tsx - Simplified without invite handling
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (newToken: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const clearAuth = () => {
    console.log('🧹 Clearing authentication and cache');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    
    queryClient.clear();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Loading auth, stored token exists:', !!storedToken);

        if (storedToken) {
          if (!isTokenExpired(storedToken)) {
            const decoded: any = jwtDecode(storedToken);
            console.log('✅ Token valid, setting user:', decoded.email);
            setToken(storedToken);
            setUser({ userId: decoded.sub, email: decoded.email });
          } else {
            console.log('❌ Token expired, clearing auth');
            clearAuth();
          }
        } else {
          console.log('🔍 No stored token found');
          queryClient.clear();
        }
      } catch (error) {
        console.error('❌ Error during auth loading:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, [queryClient]);

  const login = async (newToken: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login with new token');
      
      if (isTokenExpired(newToken)) {
        throw new Error('Received expired token');
      }

      const decoded: any = jwtDecode(newToken);
      console.log('✅ Login successful for user:', decoded.email);

      // Clear cache before setting new user to prevent stale data
      queryClient.clear();

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      
      setToken(newToken);
      setUser({ userId: decoded.sub, email: decoded.email });

      return true;
    } catch (error) {
      console.error('❌ Error during login:', error);
      clearAuth();
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 User logging out');
    clearAuth();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingInvite');
    }
    router.push('/login');
  };

  const isAuthenticated = !!token && !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};