'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'name' | 'timezone' | 'theme'>>) => Promise<void>;
  openAuthModal: (initialTab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Check stored token and restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('tp_token');
        if (savedToken) {
          setToken(savedToken);
          const res = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('tp_token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [apiUrl]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tp_token', data.token);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tp_token', data.token);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tp_token');
    }
  };

  const updateProfile = async (data: Partial<Pick<User, 'name' | 'timezone' | 'theme'>>) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${apiUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.message || 'Failed to update profile');
    }

    setUser(resData.user);
  };

  const openAuthModal = (initialTab: 'login' | 'register' = 'login') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
