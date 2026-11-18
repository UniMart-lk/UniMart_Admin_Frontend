import { Loader2, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Quick dialog to capture a rejection reason before rejecting a provider application.
 */
export default function RejectReasonModal({
  open,
  providerName,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(
      reason.trim() || 'Verification details or documents did not meet criteria.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">
            Reject Verification
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Provide a brief reason for rejecting{' '}
          <strong className="text-slate-900">{providerName}</strong>. This note
          will be saved and sent to the provider.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Please upload a clearer student ID card or complete your profile details."
            className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 resize-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
