// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  is_admin: boolean;
  avatar_url?: string;
  daily_streak?: number;
  last_daily_claim?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res: any = await api.getMe();
      if (res.success) setUser(res.data);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res: any = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تسجيل الدخول');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const res: any = await api.register(username, email, password);
      if (res.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إنشاء الحساب');
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await api.logout(refreshToken); } catch {}
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateBalance = (newBalance: number) => {
    setUser(prev => prev ? { ...prev, balance: newBalance } : null);
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout, refreshUser, updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
