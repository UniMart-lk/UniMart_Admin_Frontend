/**
 * Dashboard KPI summary metric card.
 */
export default function KpiCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  value,
  label,
  subtext,
  subtextColorClass = 'text-[#10B981]',
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div
        className={`w-9 h-9 rounded-lg ${iconBgClass} flex items-center justify-center mb-4`}
      >
        <Icon className={`w-4.5 h-4.5 ${iconColorClass}`} strokeWidth={2.2} />
      </div>

      <div className="text-[28px] leading-tight font-bold tracking-tight text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-[13px] font-medium text-slate-500">{label}</div>

      <div className={`mt-2 text-[12px] font-medium ${subtextColorClass}`}>
        {subtext}
      </div>
    </div>
  );
}

