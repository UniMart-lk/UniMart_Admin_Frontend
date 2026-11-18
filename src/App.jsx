import { Loader2 } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProvidersPage from './pages/ProvidersPage';
import UsersPage from './pages/UsersPage';
import VerificationDetailsPage from './pages/VerificationDetailsPage';
import VerificationsPage from './pages/VerificationsPage';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-dot-grid flex items-center justify-center">
      <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
        <Loader2 className="w-5 h-5 text-[#1D4ED8] animate-spin" />
        <span>Verifying admin session...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="verifications" element={<VerificationsPage />} />
            <Route
              path="verifications/:id"
              element={<VerificationDetailsPage />}
            />
            <Route
              path="marketplace-listings"
              element={<PlaceholderPage title="Marketplace Listings" />}
            />
            <Route
              path="rental-listings"
              element={<PlaceholderPage title="Rental Listings" />}
            />
            <Route
              path="categories"
              element={<PlaceholderPage title="Categories" />}
            />
            <Route
              path="reports"
              element={<PlaceholderPage title="Reports" />}
            />
            <Route
              path="reviews"
              element={<PlaceholderPage title="Reviews" />}
            />
            <Route
              path="system-monitor"
              element={<PlaceholderPage title="System Monitor" />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
