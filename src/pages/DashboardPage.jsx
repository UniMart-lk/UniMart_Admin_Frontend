import { Archive, Flag, Store, User } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import KpiCard from '../components/dashboard/KpiCard';
import ListingsCategoryChart from '../components/dashboard/ListingsCategoryChart';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import UserGrowthChart from '../components/dashboard/UserGrowthChart';

const KPI_CARDS = [
  {
    id: 'total-users',
    icon: User,
    iconBgClass: 'bg-[#EFF6FF]',
    iconColorClass: 'text-[#2563EB]',
    value: '1,248',
    label: 'Total Users',
    subtext: '+12% this week',
    subtextColorClass: 'text-[#10B981]',
  },
  {
    id: 'total-providers',
    icon: Store,
    iconBgClass: 'bg-[#ECFDF5]',
    iconColorClass: 'text-[#10B981]',
    value: '186',
    label: 'Total Providers',
    subtext: '+8% this week',
    subtextColorClass: 'text-[#10B981]',
  },
  {
    id: 'active-listings',
    icon: Archive,
    iconBgClass: 'bg-[#FEF3C7]',
    iconColorClass: 'text-[#D97706]',
    value: '524',
    label: 'Active Listings',
    subtext: '+15 this week',
    subtextColorClass: 'text-[#10B981]',
  },
  {
    id: 'pending-reports',
    icon: Flag,
    iconBgClass: 'bg-[#FEE2E2]',
    iconColorClass: 'text-[#EF4444]',
    value: '12',
    label: 'Pending Reports',
    subtext: 'Needs attention',
    subtextColorClass: 'text-[#EF4444]',
  },
];

const RECENT_ACTIVITY_ROWS = [
  {
    id: 1,
    time: '10:42 AM',
    user: 'Tharindu Asma',
    action: 'Submitted rental request',
    status: 'Pending',
  },
  {
    id: 2,
    time: '10:15 AM',
    user: 'Amal Silva',
    action: 'Submitted provider verification',
    status: 'Pending',
  },
  {
    id: 3,
    time: '9:58 AM',
    user: 'Kasun Perera',
    action: 'Accepted rental request',
    status: 'Accepted',
  },
  {
    id: 4,
    time: '9:30 AM',
    user: 'Nimal Perera',
    action: 'Posted a 5-star review',
    status: 'Published',
  },
  {
    id: 5,
    time: '9:12 AM',
    user: 'Ravi Fernando',
    action: 'Reported a listing',
    status: 'Flagged',
  },
];

/**
 * Primary UniMart Admin Dashboard overview screen.
 */
export default function DashboardPage() {
  const { searchQuery = '' } = useOutletContext() || {};
  const [showAllHint, setShowAllHint] = useState(false);

  const normalized = searchQuery.trim().toLowerCase();
  const filteredRows = normalized
    ? RECENT_ACTIVITY_ROWS.filter(
        (row) =>
          row.user.toLowerCase().includes(normalized) ||
          row.action.toLowerCase().includes(normalized) ||
          row.status.toLowerCase().includes(normalized) ||
          row.time.toLowerCase().includes(normalized)
      )
    : RECENT_ACTIVITY_ROWS;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UserGrowthChart />
        <ListingsCategoryChart />
      </div>

      {/* Recent Activity Table */}
      <RecentActivityTable
        rows={filteredRows}
        onViewAll={() => setShowAllHint((prev) => !prev)}
      />

      {showAllHint && (
        <p className="text-xs text-slate-500 px-1">
          Showing the latest 5 activity logs. Connect your section API endpoints
          next to inspect full activity history.
        </p>
      )}
    </div>
  );
}

