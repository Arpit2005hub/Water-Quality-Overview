import React, { useState } from 'react';
import { GhatInfo } from '../../types/waterQuality';
import { dataService } from '../../services/dataService';
import { GhatDetailModal } from './GhatDetailModal';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  ChevronRight,
  AlertCircle,
  Compass,
  MapPin,
  CheckCircle2,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';

interface GhatMonitoringTabProps {
  selectedYear: number | 'all';
}

export const GhatMonitoringTab: React.FC<GhatMonitoringTabProps> = ({ selectedYear }) => {
  const [selectedGhat, setSelectedGhat] = useState<GhatInfo | null>(null);
  const [waterBodyFilter, setWaterBodyFilter] = useState<string>('all');

  const ghats = dataService.getGhats();
  const summaries = dataService.getGhatSummaries(selectedYear);

  // Global counts for consistency with Overview
  const totalGhatsCount = ghats.length; // 7
  const ghatsWithDataCount = summaries.filter((s) => s.hasData).length;
  const ghatsWithoutDataCount = totalGhatsCount - ghatsWithDataCount;

  const filteredGhats = ghats.filter((g) => {
    if (waterBodyFilter === 'all') return true;
    return g.waterBodyType === waterBodyFilter;
  });

  const uniqueWaterBodies = Array.from(new Set(ghats.map((g) => g.waterBodyType)));

  return (
    <div className="space-y-5">
      {/* Primary Disclaimer Banner */}
      <DisclaimerBanner
        text="Screening indicator based on available historical observations. Observed results depend on seasonal grab sampling dates and data coverage. Zero records in a period must not be interpreted as zero risk or compliance."
        variant="screening"
      />

      {/* Consistent Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-md border border-[#DCE7E2] text-xs">
        <div className="p-2 rounded bg-[#F5F5F0]">
          <div className="text-[11px] text-[#343B38]/70 font-medium flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#416B64]" />
            <span>Cataloged Sites</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#24473D] mt-0.5">
            {totalGhatsCount} Sites
          </div>
          <div className="text-[10px] text-[#343B38]/60">Consistent Bhopal catalog</div>
        </div>

        <div className="p-2 rounded bg-[#F5F5F0]">
          <div className="text-[11px] text-[#343B38]/70 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#416B64]" />
            <span>Sites with Records</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#24473D] mt-0.5">
            {ghatsWithDataCount} of {totalGhatsCount}
          </div>
          <div className="text-[10px] text-[#343B38]/60">
            {selectedYear === 'all' ? '2021–2025 archive' : `${selectedYear} dataset`}
          </div>
        </div>

        <div className="p-2 rounded bg-[#F5F5F0]">
          <div className="text-[11px] text-[#343B38]/70 font-medium flex items-center gap-1">
            <FileQuestion className="w-3.5 h-3.5 text-[#B5811A]" />
            <span>No Data in Period</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#B5811A] mt-0.5">
            {ghatsWithoutDataCount} Sites
          </div>
          <div className="text-[10px] text-[#343B38]/60">0 records (Exceedance: N/A)</div>
        </div>

        <div className="p-2 rounded bg-[#F5F5F0]">
          <div className="text-[11px] text-[#343B38]/70 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#416B64]" />
            <span>Currently Displayed</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#24473D] mt-0.5">
            {filteredGhats.length} Sites
          </div>
          <div className="text-[10px] text-[#343B38]/60">
            {waterBodyFilter === 'all' ? 'All water bodies' : waterBodyFilter.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* Filter and Water Body Selector Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-md border border-[#DCE7E2]">
        <div>
          <h3 className="text-sm font-bold text-[#24473D]">
            Monitored Immersion Ghats ({filteredGhats.length} of {totalGhatsCount} Cataloged Sites Displayed)
          </h3>
          <p className="text-xs text-[#343B38]/70 mt-0.5">
            Monitoring locations across Upper Lake (Bhojtal), Lower Lake, and peripheral reservoirs.
            {selectedYear !== 'all' && ` Filtered for ${selectedYear}.`}
          </p>
        </div>

        {/* Water body type filter tabs */}
        <div className="flex items-center flex-wrap gap-1 p-0.5 bg-[#F5F5F0] rounded border border-[#DCE7E2]">
          <button
            onClick={() => setWaterBodyFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              waterBodyFilter === 'all'
                ? 'bg-white text-[#24473D] shadow-xs'
                : 'text-[#343B38]/70 hover:text-[#24473D]'
            }`}
          >
            All ({totalGhatsCount})
          </button>
          {uniqueWaterBodies.map((type) => {
            const countForType = ghats.filter((g) => g.waterBodyType === type).length;
            return (
              <button
                key={type}
                onClick={() => setWaterBodyFilter(type)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  waterBodyFilter === type
                    ? 'bg-white text-[#24473D] shadow-xs'
                    : 'text-[#343B38]/70 hover:text-[#24473D]'
                }`}
              >
                {type.split(' ')[0]} ({countForType})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ghat Location Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGhats.map((ghat) => {
          const summary = summaries.find((s) => s.ghatId === ghat.id);
          const hasData = summary ? summary.hasData : false;
          const totalRecords = summary ? summary.totalRecords : 0;
          const validComparable = summary ? summary.validComparableReadings : 0;
          const outOfBenchmarkCount = summary ? summary.outOfBenchmarkCount : 0;
          const outOfBenchmarkPercent = summary ? summary.outOfBenchmarkPercent : null;

          return (
            <div
              key={ghat.id}
              className={`bg-white rounded-md border border-[#DCE7E2] overflow-hidden flex flex-col justify-between ${
                !hasData ? 'border-dashed border-amber-300/80 bg-[#FCFDFB]' : ''
              }`}
            >
              {/* Authentic Photo with attribution or Neutral Catchment Header */}
              {ghat.image ? (
                <div className="h-40 w-full overflow-hidden bg-[#F5F5F0] relative border-b border-[#DCE7E2]">
                  <img
                    src={ghat.image}
                    alt={ghat.imageCaption || ghat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-2xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {ghat.waterBody}
                  </div>
                  {ghat.imageAttribution && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white/90 p-1.5 text-[9px] flex items-center justify-between">
                      <span className="truncate max-w-[210px]">{ghat.imageAttribution}</span>
                      {ghat.imageSourceUrl && (
                        <a
                          href={ghat.imageSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-white/80 shrink-0"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-20 w-full bg-[#F5F5F0] p-3 flex flex-col justify-between border-b border-[#DCE7E2]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#416B64]">
                    {ghat.waterBodyType} · Location Profile
                  </div>
                  <div className="text-xs font-bold text-[#24473D]">
                    {ghat.waterBody}
                  </div>
                </div>
              )}

              {/* Panel Main Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#24473D]">
                      {ghat.name}
                    </h4>
                    {/* Status Badge - never false safe */}
                    {!hasData ? (
                      <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded shrink-0 border border-amber-200">
                        No Data Available
                      </span>
                    ) : summary?.priorityTier === 'High Confirmatory Priority' ? (
                      <span className="text-[10px] font-semibold text-[#B33939] bg-red-50 px-2 py-0.5 rounded shrink-0 border border-red-200">
                        High Priority
                      </span>
                    ) : summary?.priorityTier === 'Moderate Surveillance' ? (
                      <span className="text-[10px] font-semibold text-[#B5811A] bg-amber-50 px-2 py-0.5 rounded shrink-0 border border-amber-200">
                        Surveillance
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#416B64] bg-emerald-50 px-2 py-0.5 rounded shrink-0 border border-emerald-200">
                        Routine Baseline
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#343B38]/75 mt-1.5 line-clamp-2 leading-relaxed">
                    {ghat.description}
                  </p>
                </div>

                {/* Quantitative Metric Strip */}
                <div className="pt-2.5 border-t border-[#DCE7E2] grid grid-cols-4 gap-1.5 text-xs text-center">
                  <div className="p-1 rounded bg-[#F5F5F0]">
                    <div className="text-[9px] text-[#343B38]/65 font-medium" title="Historical records">Records</div>
                    <div className="font-bold font-mono tabular-nums text-[#24473D] text-xs mt-0.5">
                      {totalRecords}
                    </div>
                  </div>

                  <div className="p-1 rounded bg-[#F5F5F0]">
                    <div className="text-[9px] text-[#343B38]/65 font-medium" title="CPCB Class B benchmark readings">Comparable</div>
                    <div className="font-bold font-mono tabular-nums text-[#24473D] text-xs mt-0.5">
                      {validComparable}
                    </div>
                  </div>

                  <div className="p-1 rounded bg-[#F5F5F0]">
                    <div className="text-[9px] text-[#343B38]/65 font-medium" title="Out-of-benchmark readings count">Exceedances</div>
                    <div className="font-bold font-mono tabular-nums text-[#24473D] text-xs mt-0.5">
                      {hasData ? outOfBenchmarkCount : 'N/A'}
                    </div>
                  </div>

                  <div className="p-1 rounded bg-[#F5F5F0]">
                    <div className="text-[9px] text-[#343B38]/65 font-medium" title="Exceedance rate">Exceed %</div>
                    <div
                      className={`font-bold font-mono tabular-nums text-xs mt-0.5 ${
                        outOfBenchmarkPercent !== null && outOfBenchmarkPercent >= 50
                          ? 'text-[#B33939]'
                          : outOfBenchmarkPercent !== null && outOfBenchmarkPercent >= 25
                          ? 'text-[#B5811A]'
                          : outOfBenchmarkPercent !== null
                          ? 'text-[#416B64]'
                          : 'text-[#343B38]/60'
                      }`}
                    >
                      {outOfBenchmarkPercent !== null ? `${outOfBenchmarkPercent}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Explicit zero-record callout block when no valid readings exist in active filter */}
                {!hasData && (
                  <div className="p-2.5 bg-amber-50/80 rounded border border-amber-200 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                      <span>No observations available for this period.</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Available records: <strong>0</strong> · Exceedance: <strong>N/A</strong>. Lack of observations does not imply compliance.
                    </p>
                  </div>
                )}

                {/* Sampling period & coverage status */}
                <div className="flex items-center justify-between text-[11px] text-[#343B38]/70 pt-1">
                  <span>Period: {summary?.dateRange}</span>
                  <span className={`font-semibold ${!hasData ? 'text-amber-800' : 'text-[#24473D]'}`}>
                    {summary?.coverageLabel}
                  </span>
                </div>

                {/* View Details Action */}
                <button
                  onClick={() => setSelectedGhat(ghat)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border border-[#DCE7E2] bg-[#F5F5F0] text-xs font-semibold text-[#24473D] hover:bg-[#416B64] hover:text-white hover:border-[#416B64] transition-colors cursor-pointer"
                >
                  <span>View Details & History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View with selectedYear prop passed */}
      {selectedGhat && (
        <GhatDetailModal
          ghat={selectedGhat}
          selectedYear={selectedYear}
          onClose={() => setSelectedGhat(null)}
        />
      )}
    </div>
  );
};
