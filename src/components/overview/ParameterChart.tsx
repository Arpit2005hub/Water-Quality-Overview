import React, { useState } from 'react';
import { Observation, WaterQualityParameter } from '../../types/waterQuality';
import { CPCB_BENCHMARK_STANDARDS } from '../../data/cpcbStandards';

interface ParameterChartProps {
  observations: Observation[];
}

export const ParameterChart: React.FC<ParameterChartProps> = ({ observations }) => {
  const [selectedParam, setSelectedParam] = useState<WaterQualityParameter>('DO');
  const [hoveredObs, setHoveredObs] = useState<Observation | null>(null);

  const standard = CPCB_BENCHMARK_STANDARDS[selectedParam];

  // Filter observations for the selected parameter
  const filtered = observations.filter((o) => o.parameter === selectedParam);

  // Group by phase
  const preObs = filtered.filter((o) => o.phase === 'Pre-Visarjan');
  const duringObs = filtered.filter((o) => o.phase === 'During-Visarjan');
  const postObs = filtered.filter((o) => o.phase === 'Post-Visarjan');

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Determine min and max Y domain based on parameter
  let yMin = 0;
  let yMax = 10;

  if (selectedParam === 'DO') {
    yMin = 0;
    yMax = 9;
  } else if (selectedParam === 'BOD') {
    yMin = 0;
    yMax = 12;
  } else if (selectedParam === 'pH') {
    yMin = 6.0;
    yMax = 9.5;
  } else {
    yMin = 0;
    const maxVal = Math.max(...filtered.map((o) => o.value), 20);
    yMax = Math.ceil(maxVal * 1.2);
  }

  const getYPos = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartHeight - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Y-axis grid ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    return Number((yMin + ((yMax - yMin) / tickCount) * i).toFixed(1));
  });

  return (
    <div className="bg-white rounded-md border border-[#DCE7E2] p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#24473D]">
            Water Quality Parameter Distribution
          </h3>
          <p className="text-xs text-[#343B38]/70 mt-0.5">
            Shows phase-wise distribution of {standard.fullName} across monitoring ghats relative to CPCB Class B criteria.
          </p>
        </div>

        {/* Parameter Selector segmented control */}
        <div className="inline-flex p-0.5 rounded bg-[#F5F5F0] border border-[#DCE7E2] shrink-0 self-start sm:self-auto">
          {(['DO', 'BOD', 'pH'] as WaterQualityParameter[]).map((param) => (
            <button
              key={param}
              onClick={() => setSelectedParam(param)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                selectedParam === param
                  ? 'bg-white text-[#24473D] shadow-xs'
                  : 'text-[#343B38]/70 hover:text-[#24473D]'
              }`}
            >
              {param} ({CPCB_BENCHMARK_STANDARDS[param].unit})
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Shaded pH Interval if pH is selected */}
          {selectedParam === 'pH' && (
            <rect
              x={padding.left}
              y={getYPos(8.5)}
              width={chartWidth}
              height={getYPos(6.5) - getYPos(8.5)}
              fill="#E7F4EF"
              fillOpacity="0.5"
            />
          )}

          {/* Grid lines and Y axis ticks */}
          {yTicks.map((tick) => {
            const y = getYPos(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#E1E9E4"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-[#687873] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Applicable Benchmark Line */}
          {selectedParam === 'DO' && (
            <g>
              <line
                x1={padding.left}
                y1={getYPos(5.0)}
                x2={padding.left + chartWidth}
                y2={getYPos(5.0)}
                stroke="#23856D"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x={padding.left + chartWidth - 8}
                y={getYPos(5.0) - 6}
                textAnchor="end"
                className="text-[11px] font-semibold fill-[#23856D]"
              >
                CPCB Class B Standard: ≥ 5.0 mg/L
              </text>
            </g>
          )}

          {selectedParam === 'BOD' && (
            <g>
              <line
                x1={padding.left}
                y1={getYPos(3.0)}
                x2={padding.left + chartWidth}
                y2={getYPos(3.0)}
                stroke="#D99A24"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x={padding.left + chartWidth - 8}
                y={getYPos(3.0) - 6}
                textAnchor="end"
                className="text-[11px] font-semibold fill-[#D99A24]"
              >
                CPCB Class B Standard: ≤ 3.0 mg/L
              </text>
            </g>
          )}

          {/* Phase Column Sections on X Axis */}
          {[
            { label: 'Pre-Visarjan (Baseline)', data: preObs, xCenter: padding.left + chartWidth * 0.2 },
            { label: 'During-Visarjan (Peak)', data: duringObs, xCenter: padding.left + chartWidth * 0.5 },
            { label: 'Post-Visarjan (Recovery)', data: postObs, xCenter: padding.left + chartWidth * 0.8 },
          ].map((col, idx) => {
            const spreadWidth = chartWidth * 0.22;
            const xStart = col.xCenter - spreadWidth / 2;

            return (
              <g key={col.label}>
                {/* Column background tint */}
                <rect
                  x={xStart}
                  y={padding.top}
                  width={spreadWidth}
                  height={chartHeight}
                  fill={idx % 2 === 0 ? '#FAFCFA' : '#FFFFFF'}
                  rx="6"
                />

                {/* Column X label */}
                <text
                  x={col.xCenter}
                  y={svgHeight - 14}
                  textAnchor="middle"
                  className="text-[12px] font-semibold fill-[#172B27]"
                >
                  {col.label}
                </text>

                {/* Subtitle reading count */}
                <text
                  x={col.xCenter}
                  y={svgHeight - 2}
                  textAnchor="middle"
                  className="text-[10px] fill-[#687873]"
                >
                  {col.data.length} observations
                </text>

                {/* Observation Scatter Points */}
                {col.data.map((obs, i) => {
                  // Distribute x positions across column width
                  const total = col.data.length;
                  const xOffset =
                    total > 1 ? -spreadWidth / 2 + 16 + (i / (total - 1)) * (spreadWidth - 32) : 0;
                  const cx = col.xCenter + xOffset;
                  const cy = getYPos(obs.value);
                  const isHovered = hoveredObs?.id === obs.id;

                  const dotColor = obs.isOutOfBenchmark ? '#B33939' : '#416B64';

                  return (
                    <g key={obs.id}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 7 : 5}
                        fill={dotColor}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all hover:opacity-100"
                        onMouseEnter={() => setHoveredObs(obs)}
                        onMouseLeave={() => setHoveredObs(null)}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Y Axis Label */}
          <text
            x={-svgHeight / 2}
            y="18"
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-[11px] font-medium fill-[#343B38]/70"
          >
            {standard.fullName} ({standard.unit})
          </text>
        </svg>

        {/* Floating Tooltip when point hovered */}
        {hoveredObs && (
          <div className="absolute top-2 right-4 z-20 bg-[#24473D] text-[#F5F5F0] p-3 rounded-md shadow-md text-xs max-w-xs pointer-events-none border border-[#DCE7E2]/30 animate-in fade-in">
            <div className="font-bold text-white text-xs">{hoveredObs.ghatName}</div>
            <div className="text-[#DCE7E2]/70 text-[11px]">{hoveredObs.waterBody}</div>
            <div className="mt-2 pt-1.5 border-t border-[#DCE7E2]/20 flex items-center justify-between gap-3">
              <span className="text-[#DCE7E2]/80">{hoveredObs.parameter}:</span>
              <span className="font-bold text-sm font-mono tabular-nums text-white">
                {hoveredObs.value} {hoveredObs.unit}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[11px]">
              <span className="text-[#DCE7E2]/70">Benchmark:</span>
              <span className="font-mono text-white/90">{hoveredObs.benchmarkRule}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[11px]">
              <span className="text-[#DCE7E2]/70">Evaluation:</span>
              <span
                className={`font-semibold ${
                  hoveredObs.isOutOfBenchmark ? 'text-red-300' : 'text-emerald-300'
                }`}
              >
                {hoveredObs.isOutOfBenchmark ? 'Out-of-Benchmark' : 'Within Benchmark'}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-[#DCE7E2]/60">
              Sample Date: {hoveredObs.date} · {hoveredObs.phase}
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend & Scientific Context */}
      <div className="mt-3 pt-2.5 border-t border-[#DCE7E2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#343B38]/70">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#416B64] inline-block" />
            <span>Within Applicable Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B33939] inline-block" />
            <span>Out-of-Benchmark Observation</span>
          </div>
        </div>

        <div className="text-[11px]">
          Benchmark: CPCB Class B ({standard.cpcbClassBStandard})
        </div>
      </div>
    </div>
  );
};
