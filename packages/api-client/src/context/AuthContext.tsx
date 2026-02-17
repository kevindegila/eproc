import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { iamClient } from '../lib/http-client';
import { tokenStorage } from '../lib/token-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    sigle?: string;
  } | null;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser<User>());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokenStorage.getAccessToken();

  // Verify token on mount
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    iamClient
      .post('/auth/me')
      .then((res) => {
        const userData = res.data.data ?? res.data;
        setUser(userData);
        tokenStorage.setUser(userData);
      })
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await iamClient.post('/auth/login', { email, password });
    const loginData = data.data ?? data;

    tokenStorage.setAccessToken(loginData.accessToken);
    tokenStorage.setRefreshToken(loginData.refreshToken);
    tokenStorage.setUser(loginData.user);
    setUser(loginData.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
