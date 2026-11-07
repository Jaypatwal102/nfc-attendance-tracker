'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/api';
import { getErrorMessage, logDevError } from '../utils/errorHandler';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    async function loadAuth() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const res = await authApi.getMe();
        if (res.data && res.data.data && res.data.data.user) {
          setUser(res.data.data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        logDevError('Auth Initialization Check', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { token: newToken, user: userData } = res.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      // Role-based navigation redirect
      if (userData.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else if (userData.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else {
        router.push('/');
      }

      return { success: true, user: userData };
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid email or password. Please try again.');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    role: user?.role || null,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
