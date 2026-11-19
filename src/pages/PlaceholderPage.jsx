/**
 * Placeholder view for sidebar sections awaiting step-by-step implementation.
 */
export default function PlaceholderPage({ title }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        This section is ready in the navigation shell and will be implemented in
        the next step.
      </p>
    </div>
  );
}

