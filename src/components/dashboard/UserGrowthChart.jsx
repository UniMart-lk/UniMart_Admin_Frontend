import { useState } from 'react';

const GROWTH_SERIES = [
  { date: 'Apr 1', value: 780 },
  { date: 'Apr 3', value: 825 },
  { date: 'Apr 6', value: 805 },
  { date: 'Apr 8', value: 878 },
  { date: 'Apr 10', value: 905 },
  { date: 'Apr 12', value: 892 },
  { date: 'Apr 15', value: 955 },
  { date: 'Apr 17', value: 988 },
  { date: 'Apr 19', value: 970 },
  { date: 'Apr 22', value: 1052 },
  { date: 'Apr 24', value: 1104 },
  { date: 'Apr 26', value: 1088 },
  { date: 'Apr 28', value: 1170 },
  { date: 'Apr 30', value: 1248 },
];

const AXIS_LABELS = [
  { label: 'Apr 1', index: 0 },
  { label: 'Apr 8', index: 3 },
  { label: 'Apr 15', index: 6 },
  { label: 'Apr 22', index: 9 },
  { label: 'Apr 30', index: 13 },
];

/**
 * 30-day user growth area chart rendered as a crisp responsive SVG.
 */
export default function UserGrowthChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const width = 520;
  const height = 185;
  const padX = 14;
  const padTop = 14;
  const padBottom = 14;
  const minVal = 650;
  const maxVal = 1320;

  const points = GROWTH_SERIES.map((item, idx) => {
    const x = padX + (idx / (GROWTH_SERIES.length - 1)) * (width - padX * 2);
    const y =
      padTop +
      (1 - (item.value - minVal) / (maxVal - minVal)) *
        (height - padTop - padBottom);
    return { ...item, x, y };
  });

  const linePath = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const baselineY = height - padBottom;
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;

  const gridLines = [0.15, 0.38, 0.61, 0.84].map(
    (ratio) => padTop + ratio * (height - padTop - padBottom)
  );

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
      <div className="mb-3">
        <h2 className="text-[15.5px] font-semibold text-slate-900">
          User Growth
        </h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Last 30 days</p>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
          role="img"
          aria-label="User growth over the last 30 days"
        >
          <defs>
            <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridLines.map((y, idx) => (
            <line
              key={idx}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

          <path d={areaPath} fill="url(#userGrowthFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                x2={hoveredPoint.x}
                y1={padTop}
                y2={baselineY}
                stroke="#93C5FD"
                strokeDasharray="3 3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="4.5"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {points.map((pt, idx) => (
            <circle
              key={pt.date}
              cx={pt.x}
              cy={pt.y}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
            }}
          >
            {hoveredPoint.date}: {hoveredPoint.value.toLocaleString()} users
          </div>
        )}

        <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-slate-400">
          {AXIS_LABELS.map((tick) => (
            <span key={tick.label}>{tick.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

