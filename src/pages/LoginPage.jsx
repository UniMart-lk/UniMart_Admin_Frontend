import {
  AlertTriangle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import { useAuth } from '../context/useAuth';
import { REMEMBER_EMAIL_KEY } from '../services/api';
import { extractApiError } from '../services/authService';

/**
 * UniMart Admin Panel login screen connected to UniMart Backend.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBER_EMAIL_KEY) || ''
  );
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: trimmedEmail,
        password,
        rememberMe,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Invalid credentials or unauthorized account.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dot-grid flex flex-col items-center justify-center px-4 py-10">
      {/* Main Auth Card */}
      <div className="w-full max-w-[408px] bg-white rounded-2xl border border-slate-200/75 shadow-[0_14px_38px_rgba(15,23,42,0.08)] px-8 pt-9 pb-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4.5 h-4.5" strokeWidth={2.2} />
            </div>
            <span className="text-[21px] font-bold tracking-tight text-slate-900">
              UniMart
            </span>
          </div>
          <span className="mt-1.5 text-[11.5px] font-medium text-slate-500">
            Admin Panel
          </span>
        </div>

        <h1 className="mt-5 mb-6 text-center text-[19px] font-bold tracking-tight text-slate-900">
          Sign in to continue
        </h1>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[12.5px] font-semibold text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@unimart.lk"
                className="w-full h-10.5 pl-10 pr-3.5 rounded-lg border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/15 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[12.5px] font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10.5 pl-10 pr-10 rounded-lg border border-slate-200 bg-white text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/15 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="inline-flex items-center gap-2 text-[12.5px] font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-[#1D4ED8] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[12.5px] font-medium text-[#2563EB] hover:text-blue-700 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full h-11 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-[13.5px] font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-65 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitting ? 'Signing in...' : 'Log In'}</span>
          </button>
        </form>

        {/* Restricted Access Notice */}
        {showNotice && (
          <div className="mt-5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] px-3.5 py-2.5 flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-[12px] leading-snug font-medium text-slate-700">
                Admin access is restricted to authorized personnel only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              aria-label="Dismiss notice"
              className="p-0.5 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-5 text-[11.5px] text-slate-400 text-center">
        &copy; 2026 UniMart &middot; All rights reserved
      </footer>

      {showForgotModal && (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </div>
  );
}

