import React, { useState, useMemo } from 'react';
import { Observation, WaterQualityParameter, VisarjanPhase } from '../../types/waterQuality';
import { dataService } from '../../services/dataService';
import { CPCB_BENCHMARK_STANDARDS } from '../../data/cpcbStandards';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { Info, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface AnalyticsTabProps {
  selectedYear: number | 'all';
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ selectedYear }) => {
  const [selectedParam, setSelectedParam] = useState<WaterQualityParameter>('DO');
  const [selectedGhat, setSelectedGhat] = useState<string | 'all'>('all');
  const [selectedPhase, setSelectedPhase] = useState<VisarjanPhase | 'all'>('all');
  const [hoveredObs, setHoveredObs] = useState<Observation | null>(null);

  const ghats = useMemo(() => dataService.getGhats(), []);
  const standard = CPCB_BENCHMARK_STANDARDS[selectedParam];

  // Filter observations strictly
  const filtered = useMemo(() => {
    return dataService.getObservations({
      year: selectedYear,
      parameter: selectedParam,
      ghatId: selectedGhat,
      phase: selectedPhase,
    });
  }, [selectedYear, selectedParam, selectedGhat, selectedPhase]);

  // Aggregate metrics for the filtered set
  const totalObsCount = filtered.length;
  const outOfBenchmarkCount = filtered.filter((o) => o.isOutOfBenchmark).length;
  const avgValue =
    totalObsCount > 0
      ? (filtered.reduce((acc, curr) => acc + curr.value, 0) / totalObsCount).toFixed(2)
      : 'N/A';

  // SVG Chart Setup (Scatter Timeline)
  const svgWidth = 860;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 60, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

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
  } else if (selectedParam === 'Turbidity') {
    yMin = 0;
    yMax = 40;
  }

  const getYPos = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartHeight - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    return Number((yMin + ((yMax - yMin) / 4) * i).toFixed(1));
  });

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        text="Scientific observations are displayed as discrete markers without artificial line interpolation to reflect grab sampling intervals."
        variant="screening"
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-md border border-[#DCE7E2] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Parameter Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-[#343B38]/70 mr-1">Parameter:</span>
          {(['DO', 'BOD', 'pH', 'Turbidity'] as WaterQualityParameter[]).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedParam(p)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                selectedParam === p
                  ? 'bg-[#416B64] text-white'
                  : 'bg-[#F5F5F0] text-[#343B38] border border-[#DCE7E2] hover:bg-[#DCE7E2]/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Ghat and Phase Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded border border-[#DCE7E2]">
            <label htmlFor="analytics-ghat-select" className="text-xs font-medium text-[#343B38]/70 px-1">Ghat:</label>
            <select
              id="analytics-ghat-select"
              value={selectedGhat}
              onChange={(e) => setSelectedGhat(e.target.value)}
              className="bg-white text-xs font-semibold text-[#24473D] border border-[#DCE7E2] rounded px-2 py-0.5 cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Ghats</option>
              {ghats.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded border border-[#DCE7E2]">
            <label htmlFor="analytics-phase-select" className="text-xs font-medium text-[#343B38]/70 px-1">Phase:</label>
            <select
              id="analytics-phase-select"
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value as VisarjanPhase | 'all')}
              className="bg-white text-xs font-semibold text-[#24473D] border border-[#DCE7E2] rounded px-2 py-0.5 cursor-pointer"
            >
              <option value="all">All Phases</option>
              <option value="Pre-Visarjan">Pre-Visarjan</option>
              <option value="During-Visarjan">During-Visarjan</option>
              <option value="Post-Visarjan">Post-Visarjan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scientific Parameter Overview Banner */}
      <div className="bg-[#24473D] text-[#F5F5F0] p-4 sm:p-5 rounded-md border border-[#DCE7E2]/20">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[#DCE7E2] text-xs font-semibold uppercase tracking-wider">
              <span>Scientific Parameter Assessment</span>
              <span>·</span>
              <span>CPCB Class B Standard: {standard.cpcbClassBStandard}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {standard.fullName} ({standard.unit})
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F5F0]/85 leading-relaxed">
              {standard.scientificMeaning}
            </p>
            <p className="text-xs text-[#DCE7E2]/80 leading-relaxed">
              <strong>Environmental Significance:</strong> {standard.environmentalImpact}
            </p>
          </div>

          {/* Metric Pill Summary */}
          <div className="grid grid-cols-3 gap-2.5 bg-black/20 p-2.5 rounded border border-white/10 shrink-0 text-center">
            <div>
              <div className="text-[10px] text-[#DCE7E2]/70">Readings</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                {totalObsCount}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#DCE7E2]/70">Average</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#DCE7E2]">
                {avgValue}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#DCE7E2]/70">Exceedances</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-red-200">
                {totalObsCount > 0 ? outOfBenchmarkCount : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scatter Plot Chart */}
      <div className="bg-white rounded-md border border-[#DCE7E2] p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-base font-bold text-[#172B27]">
              Historical Observation Points: {selectedParam}
            </h4>
            <p className="text-xs text-[#687873]">
              Individual sampling points plotted by date without continuous line interpolation.
            </p>
          </div>

          <div className="text-xs font-medium text-[#687873]">
            {filtered.length} discrete points
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#E1E9E4] space-y-2">
            <div className="text-sm font-bold text-[#172B27]">No observations available</div>
            <p className="text-xs text-[#687873] max-w-md mx-auto leading-relaxed">
              Available records: <strong>0</strong> · Exceedances: <strong>N/A</strong>.
              No observations recorded for {selectedParam} with the active filter. Zero records cannot be interpreted as safety or compliance.
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[680px] select-none"
            >
            {/* Shaded pH permissible interval */}
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

            {/* Grid Lines & Y Ticks */}
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

            {/* Benchmark line for DO */}
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

            {/* Benchmark line for BOD */}
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

            {/* Data Scatter Markers */}
            {filtered.map((obs, i) => {
              const xPos =
                padding.left +
                (filtered.length > 1
                  ? (i / (filtered.length - 1)) * (chartWidth - 40) + 20
                  : chartWidth / 2);
              const yPos = getYPos(obs.value);
              const isHovered = hoveredObs?.id === obs.id;
              const color = obs.isOutOfBenchmark ? '#C94C4C' : '#23856D';

              return (
                <g key={obs.id}>
                  {/* Stem line down to bottom */}
                  <line
                    x1={xPos}
                    y1={yPos}
                    x2={xPos}
                    y2={padding.top + chartHeight}
                    stroke="#E1E9E4"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />

                  {/* Marker Dot */}
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={isHovered ? 8 : 5}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredObs(obs)}
                    onMouseLeave={() => setHoveredObs(null)}
                  />

                  {/* Date label at bottom */}
                  <text
                    x={xPos}
                    y={svgHeight - 20}
                    transform={`rotate(45, ${xPos}, ${svgHeight - 20})`}
                    textAnchor="start"
                    className="text-[9px] fill-[#687873] font-mono tabular-nums"
                  >
                    {obs.date.slice(5)}
                  </text>
                </g>
              );
            })}

            {/* Y Axis Label */}
            <text
              x={-svgHeight / 2}
              y="18"
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-[11px] font-medium fill-[#687873]"
            >
              {standard.fullName} ({standard.unit})
            </text>
          </svg>

          {/* Hover Tooltip */}
          {hoveredObs && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#24473D] text-[#F5F5F0] p-3 rounded-md shadow-md text-xs border border-[#DCE7E2]/30 pointer-events-none whitespace-nowrap">
              <div className="font-bold text-white text-xs">{hoveredObs.ghatName}</div>
              <div className="text-[#DCE7E2]/80 text-[11px]">
                {hoveredObs.date} · {hoveredObs.phase} ({hoveredObs.festival})
              </div>
              <div className="mt-1 pt-1 border-t border-[#DCE7E2]/20 flex items-center gap-3">
                <span className="text-[#DCE7E2]/90">{hoveredObs.parameter}:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {hoveredObs.value} {hoveredObs.unit}
                </span>
                <span
                  className={`font-semibold ${
                    hoveredObs.isOutOfBenchmark ? 'text-red-300' : 'text-emerald-300'
                  }`}
                >
                  ({hoveredObs.isOutOfBenchmark ? 'Out of Benchmark' : 'Compliant'})
                </span>
              </div>
              <div className="text-[10px] text-[#DCE7E2]/60 mt-1 max-w-xs truncate">
                {hoveredObs.fieldNotes}
              </div>
            </div>
          )}
          </div>
        )}

        {/* Chart Explanatory Legend */}
        <div className="mt-4 pt-2.5 border-t border-[#DCE7E2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#343B38]/70">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#416B64]" />
              <span>Compliant with CPCB Benchmark</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B33939]" />
              <span>Out-of-Benchmark Observation</span>
            </div>
          </div>
          <div className="text-[11px]">
            Analytical Method: Standard Winkler / 3-day Incubation (27°C)
          </div>
        </div>
      </div>
    </div>
  );
};
