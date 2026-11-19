import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Confirmation modal for destructive or bulk admin user actions.
 */
export default function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-[#EF4444] hover:bg-red-600 text-white'
      : 'bg-[#2563EB] hover:bg-blue-700 text-white';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 text-[#EF4444] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer ${confirmClass}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
