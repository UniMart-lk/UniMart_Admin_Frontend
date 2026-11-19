import {
  Briefcase,
  Check,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../components/common/Pagination';
import RejectReasonModal from '../components/verifications/RejectReasonModal';
import { extractApiError } from '../services/authService';
import {
  fetchAdminProviders,
  verifyAdminProvider,
} from '../services/providerManagementService';
import { formatRelativeTime } from '../utils/tableHelpers';

const PAGE_LIMIT = 5;

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_BADGES = {
  PENDING: {
    label: 'Pending',
    className: 'bg-[#F59E0B] text-white',
    showIcon: false,
  },
  VERIFIED: {
    label: 'Verified',
    className: 'bg-[#10B981] text-white',
    showIcon: true,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-[#EF4444] text-white',
    showIcon: false,
  },
};

function getProviderName(provider) {
  return (
    provider?.displayName ||
    provider?.user?.userProfile?.fullName ||
    provider?.user?.email?.split('@')?.[0] ||
    'Provider'
  );
}

function getDocumentCount(provider) {
  const hasDoc = Boolean(
    provider?.verificationDocUrl ||
      provider?.user?.userProfile?.privacySettings?.studentEvidenceUrl
  );
  return hasDoc ? 1 : 0;
}

/**
 * Provider Verifications queue screen (/verifications).
 */
export default function VerificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [page, setPage] = useState(1);

  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    rejected: 0,
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyProviderId, setBusyProviderId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState(() => location.state?.feedback || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const buildParams = useCallback(() => {
    const params = {
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch,
      sort: sortOrder,
      excludeVerificationStatus: 'VERIFIED',
    };

    if (activeTab === 'pending') params.verificationStatus = 'PENDING';
    if (activeTab === 'rejected') params.verificationStatus = 'REJECTED';
    if (typeFilter) params.providerType = typeFilter;

    return params;
  }, [page, debouncedSearch, sortOrder, activeTab, typeFilter]);

  const applyResponse = useCallback((res) => {
    setErrorMessage('');
    setProviders(res.data?.providers || []);
    setTotal(res.total ?? 0);
    setTotalPages(res.totalPages || 1);
    if (res.counts) {
      setCounts(res.counts);
      window.dispatchEvent(
        new CustomEvent('unimart-verifications-updated', {
          detail: { pendingCount: res.counts.pending ?? 0 },
        })
      );
    }
    setSelectedIds([]);
  }, []);

  const reloadQueue = useCallback(async () => {
    try {
      const res = await fetchAdminProviders(buildParams());
      applyResponse(res);
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Failed to load provider verifications.')
      );
    } finally {
      setLoading(false);
    }
  }, [buildParams, applyResponse]);

  useEffect(() => {
    let active = true;
    fetchAdminProviders(buildParams())
      .then((res) => {
        if (active) applyResponse(res);
      })
      .catch((err) => {
        if (active) {
          setErrorMessage(
            extractApiError(err, 'Failed to load provider verifications.')
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [buildParams, applyResponse]);

  const allSelected =
    providers.length > 0 && providers.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : providers.map((p) => p.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = async (provider) => {
    setBusyProviderId(provider.id);
    setErrorMessage('');
    setFeedback('');
    try {
      await verifyAdminProvider(provider.id, { status: 'VERIFIED' });
      setFeedback(
        `${getProviderName(provider)} has been verified and granted provider badges.`
      );
      await reloadQueue();
    } catch (err) {
      setErrorMessage(extractApiError(err, 'Failed to approve provider.'));
    } finally {
      setBusyProviderId(null);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectTarget) return;
    setBusyProviderId(rejectTarget.id);
    setErrorMessage('');
    setFeedback('');
    try {
      await verifyAdminProvider(rejectTarget.id, {
        status: 'REJECTED',
        rejectionReason: reason,
      });
      setFeedback(`${getProviderName(rejectTarget)} verification rejected.`);
      setRejectTarget(null);
      await reloadQueue();
    } catch (err) {
      setRejectTarget(null);
      setErrorMessage(extractApiError(err, 'Failed to reject provider.'));
    } finally {
      setBusyProviderId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Toolbar */}
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
              aria-label="Search verifications"
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            />
            <button
              type="button"
              onClick={() => setSearchInput('')}
              title={searchInput ? 'Clear search' : 'Filter'}
              aria-label={searchInput ? 'Clear search' : 'Filter verifications'}
              className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                    setLoading(true);
                  }}
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

        {/* Type & Sort Dropdowns */}
        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
              setLoading(true);
            }}
            aria-label="Filter by provider type"
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="STUDENT_PROVIDER">Student Provider</option>
            <option value="EXTERNAL_PROVIDER">External Provider</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
              setLoading(true);
            }}
            aria-label="Sort verifications"
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="recent">Submitted: Recent</option>
            <option value="oldest">Submitted: Oldest</option>
            <option value="name_asc">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* Banners */}
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

      {/* Verifications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="pl-5 pr-3 py-3.5 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all verifications on page"
                    className="w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer align-middle"
                  />
                </th>
                <th className="px-4 py-3.5">PROVIDER NAME</th>
                <th className="px-4 py-3.5">TYPE</th>
                <th className="px-4 py-3.5">SUBMITTED</th>
                <th className="px-4 py-3.5">DOCUMENTS</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-5 py-3.5">ACTIONS</th>
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
                      Loading verification requests...
                    </span>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No provider verification requests found.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => {
                  const displayName = getProviderName(provider);
                  const isStudent = provider.providerType === 'STUDENT_PROVIDER';
                  const docCount = getDocumentCount(provider);
                  const statusMeta =
                    STATUS_BADGES[provider.verificationStatus] ||
                    STATUS_BADGES.PENDING;
                  const isPending = provider.verificationStatus === 'PENDING';
                  const isBusy = busyProviderId === provider.id;

                  return (
                    <tr
                      key={provider.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="pl-5 pr-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(provider.id)}
                          onChange={() => toggleSelectOne(provider.id)}
                          aria-label={`Select ${displayName}`}
                          className="w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer align-middle"
                        />
                      </td>

                      {/* Provider Name + Avatar */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {provider.user?.userProfile?.profilePictureUrl ? (
                            <img
                              src={provider.user.userProfile.profilePictureUrl}
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
                        {isStudent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5CF6] text-white text-[11px] font-semibold leading-none">
                            <GraduationCap className="w-3 h-3" />
                            Student Provider
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0891B2] text-white text-[11px] font-semibold leading-none">
                            <Briefcase className="w-3 h-3" />
                            External Provider
                          </span>
                        )}
                      </td>

                      {/* Submitted Time */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(provider.createdAt)}
                      </td>

                      {/* Documents */}
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {docCount} {docCount === 1 ? 'document' : 'documents'}
                      </td>

                      {/* Verification Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none ${statusMeta.className}`}
                        >
                          {statusMeta.showIcon && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {statusMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/verifications/${provider.id}`)
                            }
                            className="text-[13px] font-medium text-[#2563EB] hover:text-blue-700 cursor-pointer"
                          >
                            View
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleApprove(provider)}
                                className="h-8 px-3.5 rounded-lg border border-blue-400 bg-white hover:bg-blue-50 text-[#2563EB] text-[12.5px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                              >
                                {isBusy ? 'Saving...' : 'Approve'}
                              </button>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setRejectTarget(provider)}
                                className="h-8 px-3.5 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-[#EF4444] text-[12.5px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
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

      {/* Rejection Reason Modal */}
      <RejectReasonModal
        open={Boolean(rejectTarget)}
        providerName={rejectTarget ? getProviderName(rejectTarget) : ''}
        loading={busyProviderId === rejectTarget?.id}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
