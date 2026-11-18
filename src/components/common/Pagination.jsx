import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildPaginationItems } from '../../utils/tableHelpers';

/**
 * Shared table pagination footer ("Showing X-Y of Z" + numbered pages).
 */
export default function Pagination({ page, limit, total, totalPages, onPageChange }) {
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const items = buildPaginationItems(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-[12.5px] text-slate-500">
        Showing {rangeStart}&ndash;{rangeEnd} of {total.toLocaleString()}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Previous page"
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {items.map((item) =>
          typeof item === 'string' ? (
            <span
              key={item}
              className="w-8 h-8 flex items-center justify-center text-xs text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (item !== page) onPageChange(item);
              }}
              className={`w-8 h-8 rounded-md text-[12.5px] font-semibold transition-colors cursor-pointer ${
                item === page
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Next page"
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
