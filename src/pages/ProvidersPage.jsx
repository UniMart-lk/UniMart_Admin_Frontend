import {
  Ban,
  Check,
  Download,
  Globe,
  GraduationCap,
  Loader2,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Pagination from '../components/common/Pagination';
import ProviderDetailsModal from '../components/providers/ProviderDetailsModal';
import ConfirmActionModal from '../components/users/ConfirmActionModal';
import { extractApiError } from '../services/authService';
import {
  fetchAdminProviderById,
  fetchAdminProviders,
  verifyAdminProvider,
} from '../services/providerManagementService';
import {
  bulkDeleteAdminUsers,
  bulkUpdateAdminUserStatus,
  updateAdminUserStatus,
} from '../services/userManagementService';
import { downloadCsv, formatJoinedDate } from '../utils/tableHelpers';

const PAGE_LIMIT = 6;

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'studentProviders', label: 'Student' },
  { key: 'externalProviders', label: 'External' },
  { key: 'suspended', label: 'Suspended' },
];

const STATUS_BADGES = {
  ACTIVE: { label: 'Active', className: 'bg-[#10B981] text-white' },
  SUSPENDED: { label: 'Suspended', className: 'bg-[#64748B] text-white' },
  DEACTIVATED: { label: 'Deactivated', className: 'bg-[#EF4444] text-white' },
};

function getProviderName(provider) {
  return (
    provider?.displayName ||
    provider?.user?.userProfile?.fullName ||
    provider?.user?.email?.split('@')?.[0] ||
    'Provider'
  );
}

function exportProvidersToCsv(providers, filename) {
  const headers = [
    'Provider ID',
    'User ID',
    'Provider Name',
    'Type',
    'Email',
    'Verification',
    'Joined',
    'Account Status',
  ];
  const rows = providers.map((provider) => [
    provider.id,
    provider.userId,
    getProviderName(provider),
    provider.providerType === 'STUDENT_PROVIDER' ? 'Student' : 'External',
    provider.user?.email || '',
    provider.verificationStatus,
    formatJoinedDate(provider.createdAt),
    provider.user?.status || 'ACTIVE',
  ]);
  downloadCsv(headers, rows, filename);
}

/**
 * Provider Management page matching User Management layout and connected to /api/admin/providers.
 */
export default function ProvidersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [page, setPage] = useState(1);

  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({
    all: 0,
    studentProviders: 0,
    externalProviders: 0,
    pending: 0,
    suspended: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [rowBusyUserId, setRowBusyUserId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const [viewProvider, setViewProvider] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const buildFilterParams = useCallback(() => {
    const params = {
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      sort: sortOrder,
      verificationStatus: 'VERIFIED',
    };

    if (activeTab === 'studentProviders') {
      params.providerType = 'STUDENT_PROVIDER';
    } else if (activeTab === 'externalProviders') {
      params.providerType = 'EXTERNAL_PROVIDER';
    } else if (activeTab === 'suspended') {
      params.accountStatus = 'SUSPENDED';
    }

    return params;
  }, [page, debouncedSearch, sortOrder, activeTab]);

  const applyProvidersResponse = useCallback((res) => {
    setErrorMessage('');
    setProviders(res.data?.providers || []);
    setTotal(res.total ?? 0);
    setTotalPages(res.totalPages || 1);
    if (res.counts) {
      setCounts(res.counts);
    }
    setSelectedUserIds([]);
  }, []);

  const loadProviders = useCallback(async () => {
    try {
      const res = await fetchAdminProviders(buildFilterParams());
      applyProvidersResponse(res);
    } catch (err) {
      setErrorMessage(extractApiError(err, 'Failed to load providers.'));
    } finally {
      setLoading(false);
    }
  }, [buildFilterParams, applyProvidersResponse]);

  useEffect(() => {
    let active = true;
    fetchAdminProviders(buildFilterParams())
      .then((res) => {
        if (active) applyProvidersResponse(res);
      })
      .catch((err) => {
        if (active) {
          setErrorMessage(extractApiError(err, 'Failed to load providers.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [buildFilterParams, applyProvidersResponse]);

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    setLoading(true);
  };

  const handleSortChange = (nextSort) => {
    setSortOrder(nextSort);
    setPage(1);
    setLoading(true);
  };

  const allOnPageSelected =
    providers.length > 0 &&
    providers.every((provider) => selectedUserIds.includes(provider.userId));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(providers.map((provider) => provider.userId));
    }
  };

  const toggleSelectOne = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRowStatusToggle = async (userId, nextStatus) => {
    setRowBusyUserId(userId);
    setErrorMessage('');
    setFeedback('');
    try {
      await updateAdminUserStatus(userId, nextStatus);
      setFeedback(
        `Provider account ${nextStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully.`
      );
      await loadProviders();
      if (viewProvider?.userId === userId) {
        const refreshed = await fetchAdminProviderById(viewProvider.id);
        setViewProvider(refreshed);
      }
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Failed to update provider status.')
      );
    } finally {
      setRowBusyUserId(null);
    }
  };

  const handleVerifyDecision = async (providerId, status) => {
    setRowBusyUserId(viewProvider?.userId || providerId);
    setErrorMessage('');
    setFeedback('');
    try {
      const updated = await verifyAdminProvider(providerId, { status });
      setFeedback(`Provider verification updated to ${status}.`);
      setViewProvider(updated);
      await loadProviders();
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Failed to update verification status.')
      );
    } finally {
      setRowBusyUserId(null);
    }
  };

  const handleViewProvider = async (provider) => {
    setViewProvider(provider);
    setViewError('');
    setViewLoading(true);
    try {
      const detailed = await fetchAdminProviderById(provider.id);
      setViewProvider(detailed);
    } catch (err) {
      setViewError(
        extractApiError(err, 'Unable to load full provider profile.')
      );
    } finally {
      setViewLoading(false);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkBusy(true);
    setErrorMessage('');
    setFeedback('');
    try {
      const res = await bulkUpdateAdminUserStatus(selectedUserIds, 'SUSPENDED');
      setFeedback(res.message || 'Selected providers suspended.');
      await loadProviders();
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Failed to suspend selected providers.')
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkBusy(true);
    setErrorMessage('');
    setFeedback('');
    try {
      const res = await bulkDeleteAdminUsers(selectedUserIds);
      setConfirmDeleteOpen(false);
      setFeedback(res.message || 'Selected providers deleted.');
      await loadProviders();
    } catch (err) {
      setConfirmDeleteOpen(false);
      setErrorMessage(
        extractApiError(err, 'Failed to delete selected providers.')
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExportCsv = async (onlySelected = false) => {
    if (onlySelected) {
      const selectedRows = providers.filter((p) =>
        selectedUserIds.includes(p.userId)
      );
      exportProvidersToCsv(selectedRows, 'unimart-selected-providers.csv');
      return;
    }

    try {
      const res = await fetchAdminProviders({
        ...buildFilterParams(),
        page: 1,
        limit: 100,
      });
      exportProvidersToCsv(res.data?.providers || [], 'unimart-providers.csv');
    } catch (err) {
      setErrorMessage(extractApiError(err, 'Failed to export providers CSV.'));
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Filter & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex items-center w-48 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
              aria-label="Search providers"
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            />
            <button
              type="button"
              onClick={() => setSearchInput('')}
              title={searchInput ? 'Clear search' : 'Filters'}
              aria-label={searchInput ? 'Clear search' : 'Filter providers'}
              className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectTab(tab.key)}
                  className={`h-8.5 px-3.5 rounded-full text-[12.5px] font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  )}
                  <span>
                    {tab.label} ({count.toLocaleString()})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Export CSV */}
        <div className="flex items-center gap-2.5">
          <select
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort providers"
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="recent">Joined: Recent</option>
            <option value="oldest">Joined: Oldest</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="rating_desc">Rating: High-Low</option>
          </select>

          <button
            type="button"
            onClick={() => handleExportCsv(false)}
            className="h-9 px-3.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-[#2563EB] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Feedback / Error Banners */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {/* Bulk Action Selection Bar */}
      {selectedUserIds.length > 0 && (
        <div className="rounded-xl bg-[#F1F5F9] border border-slate-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-[#2563EB]">
            {selectedUserIds.length} selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={bulkBusy}
              onClick={handleBulkSuspend}
              className="h-8.5 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5 text-slate-500" />
              <span>Suspend</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => handleExportCsv(true)}
              className="h-8.5 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => setConfirmDeleteOpen(true)}
              className="h-8.5 px-3.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-[#EF4444] text-[12.5px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Providers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="pl-5 pr-3 py-3.5 w-11">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all providers on page"
                    className="w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer align-middle"
                  />
                </th>
                <th className="px-4 py-3.5">PROVIDER</th>
                <th className="px-4 py-3.5">TYPE</th>
                <th className="px-4 py-3.5">EMAIL</th>
                <th className="px-4 py-3.5">JOINED</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[13px]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                      Loading providers from database...
                    </span>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No matching providers found.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => {
                  const user = provider.user;
                  const isChecked = selectedUserIds.includes(provider.userId);
                  const displayName = getProviderName(provider);
                  const isStudentProvider =
                    provider.providerType === 'STUDENT_PROVIDER';
                  const accountStatus = user?.status || 'ACTIVE';
                  const statusMeta =
                    STATUS_BADGES[accountStatus] || STATUS_BADGES.ACTIVE;
                  const isActive = accountStatus === 'ACTIVE';
                  const isBusy = rowBusyUserId === provider.userId;

                  return (
                    <tr
                      key={provider.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-blue-50/35' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="pl-5 pr-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(provider.userId)}
                          aria-label={`Select ${displayName}`}
                          className="w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer align-middle"
                        />
                      </td>

                      {/* Provider Avatar + Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user?.userProfile?.profilePictureUrl ? (
                            <img
                              src={user.userProfile.profilePictureUrl}
                              alt={displayName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-900">
                            {displayName}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isStudentProvider ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5CF6] text-white text-[11px] font-semibold leading-none">
                            <GraduationCap className="w-3 h-3" />
                            Student
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#06B6D4] text-white text-[11px] font-semibold leading-none">
                            <Globe className="w-3 h-3" />
                            External
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {user?.email || '—'}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatJoinedDate(provider.createdAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleViewProvider(provider)}
                            className="text-[13px] font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer"
                          >
                            View
                          </button>

                          {isActive ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRowStatusToggle(
                                  provider.userId,
                                  'SUSPENDED'
                                )
                              }
                              className="min-w-[82px] h-8 px-3 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-[#EF4444] text-[12.5px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                            >
                              {isBusy ? 'Saving...' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRowStatusToggle(provider.userId, 'ACTIVE')
                              }
                              className="min-w-[82px] h-8 px-3 rounded-lg border border-blue-400 bg-white hover:bg-blue-50 text-[#2563EB] text-[12.5px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                            >
                              {isBusy ? 'Saving...' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Pagination
        page={page}
        limit={PAGE_LIMIT}
        total={total}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          setLoading(true);
        }}
      />

      {/* View Provider Details Modal */}
      <ProviderDetailsModal
        provider={viewProvider}
        loading={viewLoading}
        error={viewError}
        actionLoading={
          rowBusyUserId === viewProvider?.userId ||
          rowBusyUserId === viewProvider?.id
        }
        onToggleAccountStatus={handleRowStatusToggle}
        onVerifyDecision={handleVerifyDecision}
        onClose={() => {
          setViewProvider(null);
          setViewError('');
        }}
      />

      {/* Confirm Bulk Delete Modal */}
      <ConfirmActionModal
        open={confirmDeleteOpen}
        title="Delete selected providers?"
        message={`This will permanently remove ${selectedUserIds.length} selected provider account(s) from UniMart. This action cannot be undone.`}
        confirmLabel="Delete Providers"
        loading={bulkBusy}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
