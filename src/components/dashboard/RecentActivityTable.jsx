const STATUS_BADGE_MAP = {
  Pending: 'bg-[#F59E0B] text-white',
  Accepted: 'bg-[#10B981] text-white',
  Published: 'bg-[#2563EB] text-white',
  Flagged: 'bg-[#EF4444] text-white',
};

/**
 * Table card showing recent admin-relevant platform events.
 */
export default function RecentActivityTable({ rows, onViewAll }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-[15.5px] font-semibold text-slate-900">
          Recent Activity
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[13px] font-medium text-[#2563EB] hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-y border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3 w-[16%]">TIME</th>
              <th className="px-6 py-3 w-[26%]">USER</th>
              <th className="px-6 py-3 w-[42%]">ACTION</th>
              <th className="px-6 py-3 w-[16%]">STATUS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[13px]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No matching recent activity found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const badgeClass =
                  STATUS_BADGE_MAP[row.status] || 'bg-slate-500 text-white';
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {row.user}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {row.action}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center min-w-[74px] px-2.5 py-1 rounded-md text-[11.5px] font-semibold leading-none ${badgeClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

