// app/hooks/useAuth

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import API from '@/lib/api'; // import your axios instance

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProject, setHasProject] = useState<boolean>(false);
  const router = useRouter();

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
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setHasProject(false);
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');

        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          const decoded: any = jwtDecode(storedToken);
          setUser({ userId: decoded.sub, email: decoded.email });

          // ✅ Fetch projects directly
          const res = await API.get('/projects');
          setHasProject(res.data.length > 0);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Error during auth loading', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

const login = async (newToken: string) => {
  try {
    if (isTokenExpired(newToken)) throw new Error('Received expired token');

    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded: any = jwtDecode(newToken);
    setUser({ userId: decoded.sub, email: decoded.email });

    const res = await API.get('/projects');
    setHasProject(res.data.length > 0);

    // ✅ After login, you can return whether project exists
    return res.data.length > 0;
  } catch (error) {
    console.error('Error during login:', error);
    clearAuth();
    throw error;
  }
};

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasProject }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};