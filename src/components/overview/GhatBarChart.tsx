import React, { useState } from 'react';
import { dataService } from '../../services/dataService';

interface GhatBarChartProps {
  selectedYear: number | 'all';
}

type ComparisonMetric = 'outOfBenchmarkPercent' | 'outOfBenchmarkCount' | 'validReadings';

export const GhatBarChart: React.FC<GhatBarChartProps> = ({ selectedYear }) => {
  const [selectedMetric, setSelectedMetric] = useState<ComparisonMetric>('outOfBenchmarkPercent');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = dataService.getGhatComparisonData(selectedMetric, selectedYear);

  // Maximum value for scaling bar width (filter out negative sentinel for N/A)
  const validValues = data.filter((d) => d.value >= 0).map((d) => d.value);
  const maxValue = validValues.length > 0 ? Math.max(...validValues, 1) : 1;

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'outOfBenchmarkPercent':
        return 'Out-of-Benchmark Percentage';
      case 'outOfBenchmarkCount':
        return 'Number of Out-of-Benchmark Readings';
      case 'validReadings':
        return 'Total Valid Comparable Readings';
    }
  };

  const getTopGhatNote = () => {
    const topValid = data.find((d) => d.hasData && d.value > 0);
    if (!topValid) return null;
    if (selectedMetric === 'outOfBenchmarkPercent') {
      return `Highest observed out-of-benchmark share in available data: ${topValid.ghatName} (${topValid.value}%)`;
    }
    if (selectedMetric === 'outOfBenchmarkCount') {
      return `Most out-of-benchmark observations recorded: ${topValid.ghatName} (${topValid.value} readings)`;
    }
    return `Most monitored site in selected dataset: ${topValid.ghatName} (${topValid.value} readings)`;
  };

  return (
    <div className="bg-white rounded-md border border-[#DCE7E2] p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#24473D]">
            Ghat Screening Comparison
          </h3>
          <p className="text-xs text-[#343B38]/70 mt-0.5">
            Compares immersion locations across Bhopal by verified benchmark exceedance frequency and monitoring density.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="inline-flex p-0.5 rounded bg-[#F5F5F0] border border-[#DCE7E2] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedMetric('outOfBenchmarkPercent')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              selectedMetric === 'outOfBenchmarkPercent'
                ? 'bg-white text-[#24473D] shadow-xs'
                : 'text-[#343B38]/70 hover:text-[#24473D]'
            }`}
          >
            Exceedance %
          </button>
          <button
            onClick={() => setSelectedMetric('outOfBenchmarkCount')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              selectedMetric === 'outOfBenchmarkCount'
                ? 'bg-white text-[#24473D] shadow-xs'
                : 'text-[#343B38]/70 hover:text-[#24473D]'
            }`}
          >
            Exceedance Count
          </button>
          <button
            onClick={() => setSelectedMetric('validReadings')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              selectedMetric === 'validReadings'
                ? 'bg-white text-[#24473D] shadow-xs'
                : 'text-[#343B38]/70 hover:text-[#24473D]'
            }`}
          >
            Total Readings
          </button>
        </div>
      </div>

      {/* Metric Context Banner */}
      <div className="mb-3 px-3 py-1.5 rounded bg-[#F5F5F0] border border-[#DCE7E2] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[#24473D]">
          Metric: <span className="text-[#416B64] font-semibold">{getMetricTitle()}</span>
        </span>
        {getTopGhatNote() && (
          <span className="text-[#343B38]/70 text-[11px]">
            {getTopGhatNote()}
          </span>
        )}
      </div>

      {/* Horizontal Bar Chart List */}
      <div className="space-y-3.5 relative">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;

          let barWidthPercent = 0;
          let barColor = '#E1E9E4';

          if (item.hasData && item.value >= 0) {
            barWidthPercent = (item.value / maxValue) * 100;

            if (selectedMetric === 'outOfBenchmarkPercent') {
              if (item.value >= 60) barColor = '#B33939';
              else if (item.value >= 30) barColor = '#B5811A';
              else barColor = '#416B64';
            } else if (selectedMetric === 'outOfBenchmarkCount') {
              if (item.value >= 4) barColor = '#B33939';
              else if (item.value >= 2) barColor = '#B5811A';
              else barColor = '#416B64';
            } else {
              barColor = '#416B64';
            }
          }

          return (
            <div
              key={item.ghatId}
              className="relative group p-2 rounded transition-colors hover:bg-[#F5F5F0]"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#24473D] text-xs sm:text-sm">
                    {item.ghatName}
                  </span>
                  <span className="text-[#343B38]/60 text-[11px] hidden sm:inline">
                    · {item.waterBody}
                  </span>
                </div>
                <div
                  className={`font-mono tabular-nums font-semibold text-xs ${
                    item.hasData ? 'text-[#24473D]' : 'text-[#343B38]/60 italic'
                  }`}
                >
                  {item.hasData ? item.formatted : 'N/A (No Data)'}
                </div>
              </div>

              {/* Bar track and bar fill */}
              <div className="h-3.5 bg-[#DCE7E2]/60 rounded overflow-hidden relative">
                {item.hasData && item.value > 0 ? (
                  <div
                    className="h-full rounded transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.max(barWidthPercent, 2)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-[#343B38]/60 italic bg-[#F5F5F0]">
                    {item.hasData ? '0 exceedances recorded' : 'No data available (N/A)'}
                  </div>
                )}
              </div>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-16 right-4 z-30 bg-[#24473D] text-[#F5F5F0] p-2.5 rounded shadow-md text-xs border border-[#DCE7E2]/30 pointer-events-none whitespace-nowrap">
                  <div className="font-bold text-white text-xs">{item.ghatName}</div>
                  <div className="text-[#DCE7E2] font-mono tabular-nums mt-0.5">
                    {getMetricTitle()}: {item.hasData ? item.formatted : 'N/A'}
                  </div>
                  {item.hasData ? (
                    <div className="text-[#DCE7E2]/80 text-[11px] mt-0.5">
                      Numerator (Exceedances): {item.numerator} · Denominator (Valid Readings): {item.denominator}
                    </div>
                  ) : (
                    <div className="text-amber-200 text-[11px] mt-0.5">
                      No data available in this period. Exceedance: N/A.
                    </div>
                  )}
                  <div className="text-[#DCE7E2]/60 text-[10px]">
                    Period: {item.period}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-[#DCE7E2] text-[11px] text-[#343B38]/70 flex items-center justify-between">
        <span>
          Ranking uses descending values. Sites without observations are marked N/A and not classified as safe or polluted.
        </span>
      </div>
    </div>
  );
};
