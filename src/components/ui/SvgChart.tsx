'use client';

import React from 'react';

// Line chart
export interface LineChartPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartPoint[];
  color?: string;
  height?: number;
  showPoints?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = '#0f766e',
  height = 140,
  showPoints = true,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const padding = 20;
  const chartHeight = height - padding * 2;
  const chartWidth = 320;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = height - padding - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (curr.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) / 2;
    const cpy2 = curr.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path d={areaD} fill={`url(#grad_${color.replace('#', '')})`} />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Data points */}
          {showPoints &&
            points.map((p, i) => (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2"
                  className="transition-all duration-150 group-hover:r-5"
                />
              </g>
            ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="w-full flex justify-between mt-2 text-[10px] text-slate-500 font-medium px-1">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

// Bar chart
export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface BarChartProps {
  data: BarChartItem[];
  color?: string;
  secondaryColor?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  color = '#0f766e',
  secondaryColor = '#14b8a6',
  height = 130,
}) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0))) || 1;

  return (
    <div className="w-full flex flex-col justify-end" style={{ height }}>
      <div className="flex items-end justify-between gap-2 h-full pb-2">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / maxVal) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                {item.value}
              </div>
              <div
                className="w-full max-w-[28px] rounded-t-md transition-all duration-200 hover:opacity-90"
                style={{
                  height: `${Math.max(8, heightPercent)}%`,
                  backgroundColor: color,
                }}
              />
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut / Macro Ring chart
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 130,
  centerText,
  centerSubtext,
}) => {
  const total = segments.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((seg, idx) => {
          const percent = seg.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Center content */}
      {(centerText || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerText && <span className="text-base font-bold text-slate-900 leading-tight">{centerText}</span>}
          {centerSubtext && (
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{centerSubtext}</span>
          )}
        </div>
      )}
    </div>
  );
};
