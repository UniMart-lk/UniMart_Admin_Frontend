import {
  BadgeCheck,
  Building2,
  Calendar,
  FileText,
  Globe,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Star,
  Store,
  X,
} from 'lucide-react';
import { formatJoinedDate } from '../../utils/tableHelpers';

const VERIFICATION_STYLES = {
  VERIFIED: { label: 'Verified', className: 'bg-[#10B981] text-white' },
  PENDING: { label: 'Pending', className: 'bg-[#F59E0B] text-white' },
  REJECTED: { label: 'Rejected', className: 'bg-[#EF4444] text-white' },
};

/**
 * Modal inspecting full provider details, verification status, listings count, and status actions.
 */
export default function ProviderDetailsModal({
  provider,
  loading,
  error,
  actionLoading,
  onToggleAccountStatus,
  onVerifyDecision,
  onClose,
}) {
  if (!provider && !loading && !error) return null;

  const user = provider?.user;
  const profile = user?.userProfile;
  const isStudentProvider = provider?.providerType === 'STUDENT_PROVIDER';
  const displayName =
    provider?.displayName ||
    profile?.fullName ||
    user?.email?.split('@')?.[0] ||
    'UniMart Provider';
  const isAccountActive = user?.status === 'ACTIVE';
  const verifMeta =
    VERIFICATION_STYLES[provider?.verificationStatus] || VERIFICATION_STYLES.PENDING;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-details-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3
            id="provider-details-title"
            className="text-base font-bold text-slate-900"
          >
            Provider Details
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
              <span>Loading provider details...</span>
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
                        isStudentProvider ? 'bg-[#8B5CF6]' : 'bg-[#06B6D4]'
                      }`}
                    >
                      {isStudentProvider ? (
                        <GraduationCap className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {isStudentProvider ? 'Student' : 'External'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-white ${verifMeta.className}`}
                    >
                      {verifMeta.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>Account: {isAccountActive ? 'Active' : user?.status}</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(provider.overallRating || 0).toFixed(1)} (
                      {provider.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200/70 p-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {user?.contactNumber || profile?.contactNumber || 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Joined {formatJoinedDate(provider.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <BadgeCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Owner: {profile?.fullName || 'Not set'}
                  </span>
                </div>
              </div>

              {/* Bio & Service Info */}
              <div className="rounded-xl border border-slate-200/80 p-4 space-y-2 text-xs">
                <h5 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#2563EB]" />
                  Service Description
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  {provider.description || 'No provider description provided yet.'}
                </p>

                {provider.verificationDocUrl && (
                  <div className="pt-1 flex items-center gap-2 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      Document: <strong className="text-slate-800">{provider.verificationDocUrl}</strong>
                    </span>
                  </div>
                )}

                {isStudentProvider && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        University: <strong className="text-slate-800">{profile?.university || 'Not set'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IdCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Reg No: <strong className="text-slate-800">{profile?.universityIdNumber || 'Not set'}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Listing & Review Counts */}
              {provider._count && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {provider._count.marketplaceProducts}
                    </div>
                    <div className="text-[11px] text-slate-500">Marketplace</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {provider._count.rentalListings}
                    </div>
                    <div className="text-[11px] text-slate-500">Rentals</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 py-2.5">
                    <div className="text-base font-bold text-slate-900">
                      {provider._count.reviewsReceived}
                    </div>
                    <div className="text-[11px] text-slate-500">Reviews</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && provider && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {provider.verificationStatus !== 'VERIFIED' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onVerifyDecision(provider.id, 'VERIFIED')}
                  className="px-3.5 py-2 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  Approve Verification
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
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
                  onToggleAccountStatus(
                    user.id,
                    isAccountActive ? 'SUSPENDED' : 'ACTIVE'
                  )
                }
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer ${
                  isAccountActive
                    ? 'bg-[#EF4444] hover:bg-red-600'
                    : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                {actionLoading
                  ? 'Updating...'
                  : isAccountActive
                    ? 'Suspend Provider'
                    : 'Activate Provider'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
