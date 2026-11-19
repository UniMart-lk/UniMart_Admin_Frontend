import axios from 'axios';

export const TOKEN_KEY = 'unimart_admin_token';
export const USER_KEY = 'unimart_admin_user';
export const REMEMBER_EMAIL_KEY = 'unimart_admin_remember_email';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest =
      requestUrl.includes('/auth/admin/login') ||
      requestUrl.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      window.dispatchEvent(new Event('unimart-admin-unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default api;

