import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * Responsive shell wrapping all UniMart Admin views.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const refreshBadgeCounts = useCallback(() => {
    api
      .get('/admin/analytics/metrics')
      .then((res) => {
        const pending = res.data?.data?.metrics?.pendingProviders;
        if (typeof pending === 'number') {
          setPendingVerifications(pending);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshBadgeCounts();

    const handleUpdated = (event) => {
      const count = event?.detail?.pendingCount;
      if (typeof count === 'number') {
        setPendingVerifications(count);
      } else {
        refreshBadgeCounts();
      }
    };

    window.addEventListener('unimart-verifications-updated', handleUpdated);
    return () =>
      window.removeEventListener(
        'unimart-verifications-updated',
        handleUpdated
      );
  }, [refreshBadgeCounts]);

  const currentNav =
    ADMIN_NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/' || location.pathname === '/dashboard'
        : location.pathname.startsWith(item.path)
    ) || ADMIN_NAV_ITEMS[0];

  const isVerificationDetails = /^\/verifications\/[^/]+/.test(
    location.pathname
  );
  const headerTitle = isVerificationDetails
    ? 'Verification Details'
    : currentNav.headerTitle || currentNav.label;

  const adminName = admin?.userProfile?.fullName || 'Super Admin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        adminName={adminName}
        badgeCounts={{ pendingVerifications }}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          title={headerTitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSidebar={() => setSidebarOpen(true)}
          showSearch={!currentNav.hideHeaderSearch}
        />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>
    </div>
  );
}

