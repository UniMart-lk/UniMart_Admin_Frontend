import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/useAuth';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * Responsive shell wrapping all UniMart Admin views.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const currentNav =
    ADMIN_NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/' || location.pathname === '/dashboard'
        : location.pathname.startsWith(item.path)
    ) || ADMIN_NAV_ITEMS[0];

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
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          title={currentNav.headerTitle || currentNav.label}
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

