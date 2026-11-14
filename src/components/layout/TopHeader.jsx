import { Bell, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { AdminAvatar } from './Sidebar';

/**
 * Top bar showing current page title, search bar, notifications, and admin avatar.
 */
export default function TopHeader({
  title,
  searchQuery,
  onSearchChange,
  onOpenSidebar,
  notificationCount = 5,
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-[20px] font-bold tracking-tight text-slate-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input with Filter Icon */}
        <div className="relative hidden sm:flex items-center w-64 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            aria-label="Search dashboard"
            className="w-full h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
          />
          <button
            type="button"
            aria-label="Filter results"
            title="Filters"
            className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          aria-label={`${notificationCount} unread notifications`}
          className="relative p-2 rounded-full text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-[18px] h-[18px] fill-slate-900 text-slate-900" />
          {notificationCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Admin Profile Avatar */}
        <AdminAvatar sizeClass="w-8 h-8" />
      </div>
    </header>
  );
}

