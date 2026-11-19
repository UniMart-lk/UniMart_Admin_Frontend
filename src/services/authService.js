import api from './api';

/**
 * Extract a user-friendly error message from an Axios error.
 */
export function extractApiError(error, fallbackMessage) {
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out waiting for the server. Please verify UniMart Backend is running and try again.';
  }
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage ||
    'Request failed. Please try again.'
  );
}

/**
 * Authenticate an administrator against UniMart Backend.
 */
export async function loginAdmin({ email, password }) {
  const response = await api.post('/auth/admin/login', { email, password });
  return response.data?.data;
}

/**
 * Fetch the currently authenticated user profile from token.
 */
export async function getCurrentAdmin() {
  const response = await api.get('/auth/me');
  return response.data?.data?.user;
}

/**
 * Send a 6-digit password reset OTP to an admin email address.
 */
export async function requestPasswordReset(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

/**
 * Verify the 6-digit reset OTP code and receive a reset token.
 */
export async function verifyResetCode({ email, code }) {
  const response = await api.post('/auth/verify-reset-code', { email, code });
  return response.data?.data;
}

/**
 * Complete password reset with verified resetToken and newPassword.
 */
export async function resetPassword({ email, newPassword, resetToken }) {
  const response = await api.post('/auth/reset-password', {
    email,
    newPassword,
    resetToken,
  });
  return response.data;
}

