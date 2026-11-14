import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../../config/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

/**
 * Responsive shell wrapping all UniMart Admin views.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const currentNav =
    ADMIN_NAV_ITEMS.find((item) =>
      item.path === '/'
        ? location.pathname === '/' || location.pathname === '/dashboard'
        : location.pathname.startsWith(item.path)
    ) || ADMIN_NAV_ITEMS[0];

  const handleLogout = () => {
    window.alert('Signed out of UniMart Admin session.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          title={currentNav.label}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>
    </div>
  );
}

