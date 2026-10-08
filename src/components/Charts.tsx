import React, { useState } from 'react';
import { formatINR } from '../types/portfolio';

// 1. Donut Chart (Allocation)
interface DonutChartProps {
  data: { label: string; value: number; color: string; percent: number }[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 220,
  centerText,
  centerSubtext = 'Total Value',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((item, index) => {
              if (item.value <= 0) return null;
              const fraction = item.value / total;
              const strokeDasharray = `${circumference * fraction} ${circumference * (1 - fraction)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += fraction;

              const isHovered = hoveredIdx === index;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xs text-slate-500 font-medium">{centerSubtext}</span>
          <span className="text-sm md:text-base font-bold text-slate-800">
            {hoveredIdx !== null
              ? `${data[hoveredIdx].label}: ${data[hoveredIdx].percent.toFixed(1)}%`
              : centerText || (total > 0 ? formatINR(total) : '₹0')}
          </span>
          {hoveredIdx !== null && (
            <span className="text-xs font-semibold text-slate-600">
              {formatINR(data[hoveredIdx].value)}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${
              hoveredIdx !== null && hoveredIdx !== idx ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500 font-semibold">({item.percent.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Bar Chart: Investment vs Current Value
interface BarChartProps {
  items: { label: string; invested: number; current: number }[];
  height?: number;
}

export const CompareBarChart: React.FC<BarChartProps> = ({ items, height = 240 }) => {
  if (items.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        No investment data to display
      </div>
    );
  }

  const maxVal = Math.max(...items.flatMap((i) => [i.invested, i.current]), 1000);
  const roundedMax = Math.ceil(maxVal * 1.15);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-5 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
          <span>Invested Amount</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
          <span>Current Value</span>
        </div>
      </div>

      <div className="relative flex items-end justify-around gap-4 pt-6 pb-2 border-b border-slate-200" style={{ height }}>
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {items.map((item, idx) => {
          const investedHeight = Math.max(8, (item.invested / roundedMax) * (height - 30));
          const currentHeight = Math.max(8, (item.current / roundedMax) * (height - 30));
          const diff = item.current - item.invested;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center max-w-[120px] group relative z-10">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-800 text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg pointer-events-none whitespace-nowrap z-30">
                <p className="font-semibold">{item.label}</p>
                <p>Invested: {formatINR(item.invested)}</p>
                <p>Current: {formatINR(item.current)}</p>
                <p className={diff >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                  P/L: {diff >= 0 ? '+' : ''}{formatINR(diff)}
                </p>
              </div>

              {/* Bars container */}
              <div className="flex items-end gap-1.5 sm:gap-2 w-full justify-center">
                {/* Invested Bar */}
                <div
                  className="w-5 sm:w-7 bg-blue-500 rounded-t transition-all duration-500 hover:brightness-110 flex items-center justify-center"
                  style={{ height: `${investedHeight}px` }}
                />
                {/* Current Bar */}
                <div
                  className="w-5 sm:w-7 bg-emerald-500 rounded-t transition-all duration-500 hover:brightness-110 flex items-center justify-center"
                  style={{ height: `${currentHeight}px` }}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-medium text-slate-700 mt-2 truncate w-full text-center" title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Horizontal / Vertical Profit & Loss Bar Chart
interface PLBarChartProps {
  items: { label: string; profitLoss: number; returnPct: number }[];
}

export const ProfitLossChart: React.FC<PLBarChartProps> = ({ items }) => {
  if (items.length === 0) {
    return <div className="text-center py-6 text-slate-400 text-sm">No P/L records</div>;
  }

  const maxAbs = Math.max(...items.map((i) => Math.abs(i.profitLoss)), 100);

  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => {
        const isProfit = item.profitLoss >= 0;
        const widthPct = Math.min(100, Math.max(6, (Math.abs(item.profitLoss) / maxAbs) * 100));

        return (
          <div key={idx} className="group">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isProfit ? '+' : ''}{formatINR(item.profitLoss)}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {isProfit ? '+' : ''}{item.returnPct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isProfit ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 4. Monthly Growth Line / Trend Chart
interface MonthlyGrowthChartProps {
  records: { month: string; value: number; added: number; profitLoss: number }[];
  height?: number;
}

export const MonthlyGrowthChart: React.FC<MonthlyGrowthChartProps> = ({ records, height = 220 }) => {
  if (records.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
        No monthly records entered yet
      </div>
    );
  }

  const values = records.map((r) => r.value);
  const maxVal = Math.max(...values, 1000);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // Chart padding
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 500;
  const chartHeight = height;

  const points = records.map((r, i) => {
    const x = paddingX + (i / Math.max(records.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((r.value - minVal) / range) * (chartHeight - paddingY * 2);
    return { x, y, ...r };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
          chartHeight - paddingY
        } Z`
      : '';

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto min-w-[340px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={chartWidth - paddingX}
          y2={paddingY}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={chartHeight / 2}
          x2={chartWidth - paddingX}
          y2={chartHeight / 2}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
        <line
          x1={paddingX}
          y1={chartHeight - paddingY}
          x2={chartWidth - paddingX}
          y2={chartHeight - paddingY}
          stroke="#cbd5e1"
        />

        {/* Area fill */}
        {areaD && <path d={areaD} fill="url(#growthGrad)" />}

        {/* Line stroke */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points & labels */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="3"
              className="cursor-pointer hover:r-7 transition-all"
            />
            {/* Top Value */}
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              className="text-[11px] font-bold fill-slate-800"
            >
              {formatINR(p.value, { decimals: 0 })}
            </text>
            {/* Month label */}
            <text
              x={p.x}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-[11px] font-medium fill-slate-500"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 5. Risk Meter Speedometer Gauge (matching page 6 in uploaded report)
interface RiskMeterProps {
  level: 'Low' | 'Moderate' | 'High' | 'Medium';
}

export const RiskMeterGauge: React.FC<RiskMeterProps> = ({ level }) => {
  // Normalize
  const normalizedLevel = level === 'Medium' ? 'Moderate' : level;

  // Angles: Low = -60deg, Moderate = 0deg, High = 60deg
  const needleRotation =
    normalizedLevel === 'Low' ? -55 : normalizedLevel === 'Moderate' ? 0 : 55;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-28 overflow-hidden">
        {/* Semi-circle Gauge Arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Segments: Low (Green), Moderate (Orange/Yellow), High (Red) */}
          <path
            d="M 20 100 A 80 80 0 0 1 65 35"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 72 29 A 80 80 0 0 1 128 29"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
          />
          <path
            d="M 135 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Needle pivot */}
          <circle cx="100" cy="100" r="8" fill="#1e293b" />

          {/* Needle Pointer */}
          <g
            style={{
              transformOrigin: '100px 100px',
              transform: `rotate(${needleRotation}deg)`,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <polygon points="97,100 103,100 100,25" fill="#1e293b" />
            <circle cx="100" cy="100" r="4" fill="#38bdf8" />
          </g>
        </svg>
      </div>

      {/* Legend below gauge */}
      <div className="flex items-center justify-between w-48 text-xs font-semibold mt-1">
        <span className={normalizedLevel === 'Low' ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
          Low
        </span>
        <span className={normalizedLevel === 'Moderate' ? 'text-amber-700 font-bold' : 'text-slate-400'}>
          Moderate
        </span>
        <span className={normalizedLevel === 'High' ? 'text-rose-700 font-bold' : 'text-slate-400'}>
          High
        </span>
      </div>

      <div className="mt-2 text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-700">
        Assessed Risk: <span className="font-bold text-blue-700">{normalizedLevel}</span>
      </div>
    </div>
  );
};
