import {
  BadgeCheck,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Shield,
  Store,
  X,
} from 'lucide-react';

function formatJoinedDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Modal showing complete user profile, verification info, and quick status toggle.
 */
export default function UserDetailsModal({
  user,
  loading,
  error,
  actionLoading,
  onToggleStatus,
  onClose,
}) {
  if (!user && !loading && !error) return null;

  const profile = user?.userProfile;
  const provider = user?.providerProfile;
  const isStudent =
    profile?.userType === 'STUDENT' ||
    provider?.providerType === 'STUDENT_PROVIDER';
  const displayName =
    profile?.fullName || user?.email?.split('@')?.[0] || 'UniMart User';
  const isActive = user?.status === 'ACTIVE';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-details-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3
            id="user-details-title"
            className="text-base font-bold text-slate-900"
          >
            User Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2.5 text-sm text-slate-500">
              <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
              <span>Loading user details...</span>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Profile Summary */}
              <div className="flex items-center gap-4">
                {profile?.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={displayName}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2563EB] font-bold text-lg flex items-center justify-center shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {displayName}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white ${
                        isStudent ? 'bg-[#8B5CF6]' : 'bg-[#06B6D4]'
                      }`}
                    >
                      {isStudent ? (
                        <GraduationCap className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {isStudent ? 'Student' : 'External'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-white ${
                        isActive ? 'bg-[#10B981]' : 'bg-[#64748B]'
                      }`}
                    >
                      {user.status === 'ACTIVE'
                        ? 'Active'
                        : user.status === 'SUSPENDED'
                          ? 'Suspended'
                          : 'Deactivated'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Role: {user.role} &middot; Profile{' '}
                    {profile?.isCompleted ? 'Completed' : 'Incomplete'}
                  </p>
                </div>
              </div>

              {/* Account Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200/70 p-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {user.contactNumber || profile?.contactNumber || 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Joined {formatJoinedDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <BadgeCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Email {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              {/* Student / External Details */}
              <div className="rounded-xl border border-slate-200/80 p-4 space-y-2.5 text-xs">
                <h5 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                  Identity &amp; Campus Details
                </h5>

                {isStudent ? (
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        University:{' '}
                        <strong className="text-slate-800">
                          {profile?.university || 'Not provided'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Faculty:{' '}
                        <strong className="text-slate-800">
                          {profile?.faculty || 'Not provided'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Registration No:{' '}
                        <strong className="text-slate-800">
                          {profile?.universityIdNumber || 'Not provided'}
                        </strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        NIC / ID Number:{' '}
                        <strong className="text-slate-800">
                          {profile?.nicNumber || 'Not provided'}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Details if applicable */}
              {provider && (
                <div className="rounded-xl border border-slate-200/80 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                      <Store className="w-3.5 h-3.5 text-[#2563EB]" />
                      Provider Profile
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {provider.verificationStatus}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {provider.displayName}
                  </p>
                  {provider.description && (
                    <p className="text-slate-500">{provider.description}</p>
                  )}
                </div>
              )}

              {/* Activity Counts */}
              {user._count && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {user._count.bookings}
                    </div>
                    <div className="text-[11px] text-slate-500">Bookings</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {user._count.reviews}
                    </div>
                    <div className="text-[11px] text-slate-500">Reviews</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {user._count.filedReports}
                    </div>
                    <div className="text-[11px] text-slate-500">Reports</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && user && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() =>
                onToggleStatus(user.id, isActive ? 'SUSPENDED' : 'ACTIVE')
              }
              className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer ${
                isActive
                  ? 'bg-[#EF4444] hover:bg-red-600'
                  : 'bg-[#2563EB] hover:bg-blue-700'
              }`}
            >
              {actionLoading
                ? 'Updating...'
                : isActive
                  ? 'Suspend User'
                  : 'Activate User'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
