import { GraduationCap, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from '../../config/navigation';

/**
 * Shared avatar graphic for the signed-in Super Admin profile.
 */
export function AdminAvatar({ sizeClass = 'w-8 h-8' }) {
  return (
    <div
      className={`${sizeClass} rounded-full bg-sky-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0`}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full"
        aria-label="Super Admin Avatar"
      >
        <rect width="36" height="36" fill="#DBEAFE" />
        <circle cx="18" cy="14" r="6" fill="#FBBF24" />
        <path
          d="M12 13c0-3.5 2.7-6 6-6s6 2.5 6 6v1c-1.8-.8-3.8-1.2-6-1.2s-4.2.4-6 1.2v-1z"
          fill="#334155"
        />
        <path
          d="M7 33c1.2-6.2 5.4-9.5 11-9.5S27.8 26.8 29 33H7z"
          fill="#2563EB"
        />
      </svg>
    </div>
  );
}

/**
 * Left navigation sidebar matching the UniMart Admin layout.
 */
export default function Sidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4.5 h-4.5" strokeWidth={2.2} />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-slate-900">
              UniMart
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(({ path, label, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        isActive ? 'text-[#2563EB]' : 'text-slate-500'
                      }`}
                      strokeWidth={2}
                    />
                    <span className="truncate">{label}</span>
                  </span>

                  {typeof badge === 'number' && badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444] text-white text-[11px] font-semibold leading-none">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Super Admin Profile */}
        <div className="border-t border-slate-100 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <AdminAvatar sizeClass="w-8 h-8" />
            <span className="text-[13.5px] font-medium text-slate-800 truncate">
              Super Admin
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Log Out"
            aria-label="Log Out"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}

