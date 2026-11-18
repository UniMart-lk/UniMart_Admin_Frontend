import {
  Archive,
  Car,
  Flag,
  LayoutGrid,
  Monitor,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Users,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  {
    path: '/users',
    label: 'Users',
    headerTitle: 'User Management',
    hideHeaderSearch: true,
    icon: Users,
  },
  {
    path: '/providers',
    label: 'Providers',
    headerTitle: 'Provider Management',
    hideHeaderSearch: true,
    icon: Store,
  },
  { path: '/verifications', label: 'Verifications', icon: ShieldCheck, badge: 8 },
  { path: '/marketplace-listings', label: 'Marketplace Listings', icon: Archive },
  { path: '/rental-listings', label: 'Rental Listings', icon: Car },
  { path: '/categories', label: 'Categories', icon: Tag },
  { path: '/reports', label: 'Reports', icon: Flag, badge: 3 },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/system-monitor', label: 'System Monitor', icon: Monitor },
];

