const CATEGORY_SEGMENTS = [
  { label: 'Academic', count: 156, color: '#2563EB' },
  { label: 'Electronics', count: 124, color: '#10B981' },
  { label: 'Books', count: 89, color: '#F59E0B' },
  { label: 'Other categories', count: 155, color: '#CBD5E1' },
];

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function createDonutSegmentPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/**
 * Donut breakdown of current active listings by category.
 */
export default function ListingsCategoryChart() {
  const total = CATEGORY_SEGMENTS.reduce((sum, item) => sum + item.count, 0);
  const gapDeg = 2.4;

  const slices = CATEGORY_SEGMENTS.reduce(
    (acc, seg) => {
      const sweep = (seg.count / total) * 360;
      const startAngle = acc.cursor + gapDeg / 2;
      const endAngle = acc.cursor + sweep - gapDeg / 2;
      acc.items.push({
        ...seg,
        path: createDonutSegmentPath(80, 80, 72, 46, startAngle, endAngle),
      });
      acc.cursor += sweep;
      return acc;
    },
    { cursor: -90, items: [] }
  ).items;

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
      <div>
        <h2 className="text-[15.5px] font-semibold text-slate-900">
          Listings by Category
        </h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Current</p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 px-2 py-2">
        <svg
          viewBox="0 0 160 160"
          className="w-40 h-40 shrink-0"
          role="img"
          aria-label="Listings distribution donut chart"
        >
          {slices.map((slice) => (
            <path key={slice.label} d={slice.path} fill={slice.color} />
          ))}
        </svg>

        <ul className="w-full max-w-[240px] space-y-2.5">
          {CATEGORY_SEGMENTS.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between text-[13px]"
            >
              <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </span>
              <span className="text-slate-500 font-medium tabular-nums">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

