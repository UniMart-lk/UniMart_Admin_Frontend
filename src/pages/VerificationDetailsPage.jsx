import {
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extractApiError } from '../services/authService';
import {
  fetchAdminProviderById,
  verifyAdminProvider,
} from '../services/providerManagementService';
import { formatJoinedDate } from '../utils/tableHelpers';

const STATUS_BADGES = {
  PENDING: { label: 'Pending', className: 'bg-[#F59E0B] text-white' },
  VERIFIED: { label: 'Verified', className: 'bg-[#10B981] text-white' },
  REJECTED: { label: 'Rejected', className: 'bg-[#EF4444] text-white' },
};

/**
 * Verification Details review page (/verifications/:id) showing only relevant UniMart fields.
 */
export default function VerificationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  const [adminNotes, setAdminNotes] = useState('');
  const [decision, setDecision] = useState('VERIFIED');
  const [checklist, setChecklist] = useState({
    profileCompleted: false,
    identityRequirementMet: false,
    noDuplicateAccount: true,
    noViolations: true,
  });
  const [previewDocOpen, setPreviewDocOpen] = useState(false);

  const hydrateFromProvider = useCallback((data) => {
    setProvider(data);
    setAdminNotes(data?.rejectionReason || '');
    setDecision(
      data?.verificationStatus === 'REJECTED' ? 'REJECTED' : 'VERIFIED'
    );

    const user = data?.user;
    const profile = user?.userProfile;
    const checks = data?.verificationChecks || {};
    const isStudent = data?.providerType === 'STUDENT_PROVIDER';
    const hasDoc = Boolean(
      data?.verificationDocUrl || profile?.privacySettings?.studentEvidenceUrl
    );
    const hasContactOrVerifiedEmail = Boolean(
      user?.emailVerified || user?.contactNumber || profile?.contactNumber
    );

    setChecklist({
      profileCompleted: Boolean(
        checks.profileCompleted ?? profile?.isCompleted
      ),
      identityRequirementMet: isStudent ? hasDoc : hasContactOrVerifiedEmail,
      noDuplicateAccount: Boolean(checks.noDuplicateAccount ?? true),
      noViolations: Boolean(checks.noViolations ?? true),
    });
  }, []);

  useEffect(() => {
    let active = true;
    fetchAdminProviderById(id)
      .then((data) => {
        if (active) hydrateFromProvider(data);
      })
      .catch((err) => {
        if (active) {
          setErrorMessage(
            extractApiError(err, 'Failed to load verification details.')
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, hydrateFromProvider]);

  const submitDecision = async (targetStatus) => {
    if (!provider) return;
    setSubmitting(true);
    setErrorMessage('');
    setFeedback('');

    try {
      const updated = await verifyAdminProvider(provider.id, {
        status: targetStatus,
        rejectionReason: adminNotes.trim() || undefined,
      });

      hydrateFromProvider({
        ...updated,
        verificationChecks: provider.verificationChecks,
      });

      window.dispatchEvent(new CustomEvent('unimart-verifications-updated'));

      setFeedback(
        targetStatus === 'VERIFIED'
          ? 'Provider approved! Student/External + Verified badges are now active on their profile.'
          : targetStatus === 'REJECTED'
            ? 'Provider verification rejected and notification sent.'
            : 'Additional information requested from the provider.'
      );
    } catch (err) {
      setErrorMessage(
        extractApiError(err, 'Failed to save verification decision.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-16 flex items-center justify-center gap-2.5 text-sm text-slate-500 max-w-[1400px]">
        <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
        <span>Loading verification details...</span>
      </div>
    );
  }

  if (errorMessage && !provider) {
    return (
      <div className="max-w-[1400px] space-y-4">
        <button
          type="button"
          onClick={() => navigate('/verifications')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Provider Verifications
        </button>
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  const user = provider?.user;
  const profile = user?.userProfile;
  const isStudent = provider?.providerType === 'STUDENT_PROVIDER';
  const displayName =
    provider?.displayName ||
    profile?.fullName ||
    user?.email?.split('@')?.[0] ||
    'Provider';
  const statusMeta =
    STATUS_BADGES[provider?.verificationStatus] || STATUS_BADGES.PENDING;
  const docUrl =
    provider?.verificationDocUrl ||
    profile?.privacySettings?.studentEvidenceUrl ||
    null;

  const infoRows = [
    { label: 'Full Name', value: profile?.fullName || 'Not provided' },
    { label: 'Email', value: user?.email || '—' },
    {
      label: 'Contact',
      value: user?.contactNumber || profile?.contactNumber || 'Not provided',
    },
    {
      label: 'Provider Type',
      value: isStudent ? 'Student Provider' : 'External Provider',
    },
    ...(isStudent
      ? [
          {
            label: 'University',
            value: profile?.university || 'Not provided',
          },
          { label: 'Faculty', value: profile?.faculty || 'Not provided' },
          {
            label: 'Student ID',
            value: profile?.universityIdNumber || 'Not provided',
          },
        ]
      : [
          {
            label: 'Display Name',
            value: provider?.displayName || 'Not provided',
          },
          {
            label: 'Service Details',
            value: provider?.description || 'Not provided',
          },
        ]),
    { label: 'Registered', value: formatJoinedDate(provider?.createdAt) },
  ];

  const checklistItems = [
    {
      key: 'profileCompleted',
      label: 'Profile details completed',
    },
    {
      key: 'identityRequirementMet',
      label: isStudent
        ? 'Student ID document uploaded'
        : 'Email & contact details verified',
    },
    {
      key: 'noDuplicateAccount',
      label: 'No duplicate account',
    },
    {
      key: 'noViolations',
      label: 'No previous violations',
    },
  ];

  const handleDownloadDocument = () => {
    if (!docUrl) return;
    if (docUrl.startsWith('http') || docUrl.startsWith('data:')) {
      const anchor = document.createElement('a');
      anchor.href = docUrl;
      anchor.download = docUrl.split('/').pop() || 'verification-document';
      anchor.target = '_blank';
      anchor.click();
      return;
    }

    const blob = new Blob(
      [
        `UniMart Verification Document Reference\nProvider: ${displayName}\nEmail: ${user?.email}\nDocument: ${docUrl}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${displayName.replace(/\s+/g, '_')}_document_info.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Top Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/verifications')}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verifications</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submitDecision('REJECTED')}
            className="h-9 px-4 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-[#EF4444] text-[13px] font-semibold transition-colors disabled:opacity-60 cursor-pointer"
          >
            Reject
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => submitDecision('VERIFIED')}
            className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            )}
            <span>Approve</span>
          </button>
        </div>
      </div>

      {/* Feedback / Error Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Provider Information + Submitted Documents */}
        <div className="lg:col-span-7 space-y-5">
          {/* Provider Information Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-[15.5px] font-semibold text-slate-900 mb-5">
              Provider Information
            </h2>

            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              {profile?.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] font-bold text-xl flex items-center justify-center shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-[17px] font-bold text-slate-900">
                  {displayName}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
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

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 text-[13px]">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4"
                >
                  <dt className="text-slate-500 font-medium">{row.label}</dt>
                  <dd className="sm:col-span-2 text-slate-900 font-medium break-words">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Submitted Documents Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15.5px] font-semibold text-slate-900">
                Submitted Documents
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {docUrl ? '1 file' : '0 files'}
              </span>
            </div>

            {docUrl ? (
              <div className="rounded-xl border border-slate-200/90 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 text-[#EF4444] flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-900 truncate">
                      {docUrl.split('/').pop()}
                    </p>
                    <p className="text-[11.5px] text-slate-400">
                      Verification evidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewDocOpen(true)}
                    aria-label="Preview document"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDocument}
                    aria-label="Download document"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                {isStudent
                  ? 'No Student ID document uploaded yet.'
                  : 'No document required for email-verified external providers unless requested.'}
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Checklist + Admin Notes + Decision */}
        <div className="lg:col-span-5 space-y-5">
          {/* Verification Checklist Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-[15.5px] font-semibold text-slate-900 mb-4">
              Verification Checklist
            </h2>

            <div className="space-y-3">
              {checklistItems.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 text-[13px] font-medium text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[item.key])}
                    onChange={(e) =>
                      setChecklist((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Admin Notes Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-[15.5px] font-semibold text-slate-900 mb-3">
              Admin Notes
            </h2>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add verification notes..."
              className="w-full rounded-lg border border-slate-200 p-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 resize-none"
            />
          </section>

          {/* Decision Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <h2 className="text-[15.5px] font-semibold text-slate-900 mb-4">
              Decision
            </h2>

            <div className="space-y-3 mb-5">
              {[
                {
                  value: 'VERIFIED',
                  label: 'Approve — Send verification badge',
                },
                {
                  value: 'REJECTED',
                  label: 'Reject — Send rejection notice',
                },
                {
                  value: 'PENDING',
                  label: 'Request More Info — Ask for additional documents',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 text-[13px] font-medium text-slate-700 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="verificationDecision"
                    value={option.value}
                    checked={decision === option.value}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => submitDecision(decision)}
              className="w-full h-10.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Confirm Decision</span>
            </button>
          </section>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocOpen && docUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Document Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDocOpen(false)}
                aria-label="Close document preview"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {docUrl.startsWith('http') || docUrl.startsWith('data:image') ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 max-h-96 flex items-center justify-center">
                <img
                  src={docUrl}
                  alt="Submitted verification document"
                  className="max-h-96 object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-xs space-y-2 text-slate-700">
                <p>
                  <strong>Submitted File:</strong> {docUrl}
                </p>
                <p>
                  <strong>Provider:</strong> {displayName} ({user?.email})
                </p>
                <p className="text-slate-500">
                  Attached from the UniMart mobile verification upload flow.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
