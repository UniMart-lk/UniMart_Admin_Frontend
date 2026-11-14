import { useCallback, useEffect, useState } from 'react';
import {
  getStoredToken,
  REMEMBER_EMAIL_KEY,
  TOKEN_KEY,
  USER_KEY,
} from '../services/api';
import { getCurrentAdmin, loginAdmin } from '../services/authService';
import { AuthContext } from './authContextObject';

function readStoredAdmin() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.role === 'ADMIN' ? parsed : null;
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Provides authenticated UniMart admin session state across the app.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [admin, setAdmin] = useState(() => readStoredAdmin());
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('unimart-admin-unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener(
        'unimart-admin-unauthorized',
        handleUnauthorized
      );
  }, [logout]);

  useEffect(() => {
    let active = true;
    const storedToken = getStoredToken();
    if (!storedToken) {
      return undefined;
    }

    getCurrentAdmin()
      .then((user) => {
        if (!active) return;
        if (!user || user.role !== 'ADMIN') {
          logout();
          return;
        }
        setAdmin(user);
        const targetStorage = localStorage.getItem(TOKEN_KEY)
          ? localStorage
          : sessionStorage;
        targetStorage.setItem(USER_KEY, JSON.stringify(user));
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout]);

  const login = useCallback(async ({ email, password, rememberMe = true }) => {
    const data = await loginAdmin({ email, password });

    if (!data?.token || !data?.user || data.user.role !== 'ADMIN') {
      throw new Error(
        'Access denied. Admin access is restricted to authorized personnel only.'
      );
    }

    clearAuthStorage();
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem(TOKEN_KEY, data.token);
    targetStorage.setItem(USER_KEY, JSON.stringify(data.user));

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, data.user.email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setToken(data.token);
    setAdmin(data.user);
    return data.user;
  }, []);

  const value = {
    admin,
    token,
    loading,
    isAuthenticated: Boolean(token && admin?.role === 'ADMIN'),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

