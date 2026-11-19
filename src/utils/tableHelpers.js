/**
 * Format an ISO timestamp into "Jan 15, 2026".
 */
export function formatJoinedDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format an ISO timestamp into a compact relative time string like "2h ago" or "3d ago".
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  const diffMs = Math.max(0, Date.now() - new Date(dateString).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatJoinedDate(dateString);
}

/**
 * Download tabular records as an RFC-4180 escaped CSV file.
 */
export function downloadCsv(headers, rows, filename) {
  const escapeCsv = (value) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`;

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Build compact pagination page numbers with left/right ellipses.
 */
export function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const items = [1];
  if (currentPage > 3) items.push('ellipsis-left');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p += 1) {
    items.push(p);
  }

  if (currentPage < totalPages - 2) items.push('ellipsis-right');
  items.push(totalPages);
  return items;
}
