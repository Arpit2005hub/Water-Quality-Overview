import React, { useState } from 'react';
import { GhatInfo } from '../../types/waterQuality';
import { dataService } from '../../services/dataService';
import { X, AlertCircle, FileQuestion, Calendar, Check, Info, ExternalLink } from 'lucide-react';

interface GhatDetailModalProps {
  ghat: GhatInfo | null;
  selectedYear: number | 'all';
  onClose: () => void;
}

export const GhatDetailModal: React.FC<GhatDetailModalProps> = ({
  ghat,
  selectedYear,
  onClose,
}) => {
  if (!ghat) return null;

  // Option to view either the currently active year filter or all historical records
  const [viewScope, setViewScope] = useState<'current' | 'all'>('current');

  const activeFilterYear = viewScope === 'current' ? selectedYear : 'all';
  const observations = dataService.getObservations({
    ghatId: ghat.id,
    year: activeFilterYear,
  });
  const allTimeObservations = dataService.getObservations({
    ghatId: ghat.id,
    year: 'all',
  });

  const summaries = dataService.getGhatSummaries(activeFilterYear);
  const summary = summaries.find((s) => s.ghatId === ghat.id);
  const hasData = observations.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E1E9E4] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-[#E1E9E4] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#23856D] uppercase tracking-wider">
                {ghat.waterBodyType}
              </span>
              <span className="text-xs text-[#687873]">·</span>
              <span className="text-xs text-[#687873]">{ghat.waterBody}</span>
            </div>
            <h2 className="text-xl font-bold text-[#172B27] mt-0.5">
              {ghat.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Scope Toggle if a specific year is filtered */}
            {selectedYear !== 'all' && (
              <div className="flex items-center p-0.5 bg-[#F7F9F7] rounded-lg border border-[#E1E9E4] text-xs">
                <button
                  onClick={() => setViewScope('current')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    viewScope === 'current'
                      ? 'bg-white text-[#172B27] shadow-xs'
                      : 'text-[#687873] hover:text-[#172B27]'
                  }`}
                >
                  {selectedYear} Filter
                </button>
                <button
                  onClick={() => setViewScope('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    viewScope === 'all'
                      ? 'bg-white text-[#172B27] shadow-xs'
                      : 'text-[#687873] hover:text-[#172B27]'
                  }`}
                >
                  All Years ({allTimeObservations.length})
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#687873] hover:text-[#172B27] hover:bg-[#F7F9F7] rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Scientific Disclaimer Note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
            <div className="leading-relaxed">
              <strong>Data Transparency & Scientific Limitation:</strong> Historical screening prototype using illustrative observations calibrated to CPCB Class B benchmarks. Observed values depend on discrete festival grab sampling and do not represent continuous real-time conditions.
            </div>
          </div>

          {/* Zero-Record Notification Banner when active filter has 0 records */}
          {!hasData && (
            <div className="p-4 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <FileQuestion className="w-4 h-4 text-amber-700 shrink-0" />
                <span>No Observations in Selected Evaluation Period ({activeFilterYear})</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                Available records: <strong>0</strong> · Exceedance rate: <strong>N/A</strong>.
                Zero available records must not be interpreted as zero exceedance or regulatory compliance. No baseline conclusion can be drawn from zero observations.
              </p>
              {allTimeObservations.length > 0 && viewScope === 'current' && (
                <button
                  onClick={() => setViewScope('all')}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#23856D] hover:bg-[#155E63] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>Switch to All Historical Years ({allTimeObservations.length} records available)</span>
                </button>
              )}
            </div>
          )}

          {/* Ghat Image & Hydrology Context */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {ghat.image ? (
              <div className="md:col-span-5 rounded-md overflow-hidden border border-[#DCE7E2] bg-[#F5F5F0] relative">
                <img
                  src={ghat.image}
                  alt={ghat.imageCaption || ghat.name}
                  className="w-full h-full object-cover min-h-[200px]"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white p-2 text-[10px] leading-tight backdrop-blur-2xs">
                  <div>{ghat.imageCaption || ghat.waterBody}</div>
                  {ghat.imageAttribution && (
                    <div className="text-white/70 text-[9px] mt-0.5 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{ghat.imageAttribution}</span>
                      {ghat.imageSourceUrl && (
                        <a
                          href={ghat.imageSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-white/90 shrink-0"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="md:col-span-5 rounded-md border border-[#DCE7E2] bg-[#F5F5F0] p-4 flex flex-col justify-center">
                <div className="text-[11px] font-semibold text-[#416B64] uppercase tracking-wider">
                  Catchment Profile
                </div>
                <div className="text-sm font-bold text-[#24473D] mt-1">
                  {ghat.waterBody}
                </div>
                <div className="text-xs text-[#343B38]/70 mt-2 leading-relaxed">
                  {ghat.coordinatesApprox}
                </div>
              </div>
            )}

            <div className="md:col-span-7 flex flex-col justify-between space-y-2.5">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#343B38]/70 mb-1">
                  Historical & Environmental Context
                </h4>
                <p className="text-xs text-[#343B38] leading-relaxed">
                  {ghat.description}
                </p>
                <p className="text-xs text-[#343B38]/70 mt-1.5 leading-relaxed">
                  {ghat.historicalContext}
                </p>
              </div>

              <div className="p-2.5 bg-[#F5F5F0] rounded border border-[#DCE7E2] text-xs">
                <span className="font-semibold text-[#24473D]">
                  Immersion Infrastructure:
                </span>{' '}
                <span className="text-[#343B38]/80">{ghat.immersionInfrastructure}</span>
              </div>
            </div>
          </div>

          {/* Key Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4]">
                <div className="text-xs text-[#687873]">Available Records</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#172B27] mt-1">
                  {summary.totalRecords}
                </div>
                <div className="text-[11px] text-[#687873]">
                  {summary.coverageLabel}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4]">
                <div className="text-xs text-[#687873]">Exceedance Rate</div>
                <div
                  className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                    summary.outOfBenchmarkPercent !== null && summary.outOfBenchmarkPercent >= 40
                      ? 'text-[#C94C4C]'
                      : summary.outOfBenchmarkPercent !== null
                      ? 'text-[#172B27]'
                      : 'text-[#687873]'
                  }`}
                >
                  {summary.outOfBenchmarkPercent !== null
                    ? `${summary.outOfBenchmarkPercent}%`
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-[#687873]">
                  {summary.hasData
                    ? `${summary.outOfBenchmarkCount} of ${summary.validComparableReadings} readings`
                    : '0 comparable readings'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4]">
                <div className="text-xs text-[#687873]">Lowest DO Recorded</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#172B27] mt-1">
                  {summary.minDOObserved !== null ? `${summary.minDOObserved} mg/L` : 'N/A'}
                </div>
                <div className="text-[11px] text-[#687873]">
                  {summary.minDOObserved !== null && summary.minDOObserved < 4.0
                    ? 'Hypoxic drawdown'
                    : summary.minDOObserved !== null
                    ? 'Adequate'
                    : 'Unmeasured in period'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4]">
                <div className="text-xs text-[#687873]">Peak BOD Observed</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#172B27] mt-1">
                  {summary.maxBODObserved !== null ? `${summary.maxBODObserved} mg/L` : 'N/A'}
                </div>
                <div className="text-[11px] text-[#687873]">
                  CPCB Limit: 3.0 mg/L
                </div>
              </div>
            </div>
          )}

          {/* Parameter Measurement History Table or Zero-Record Empty State */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-[#172B27]">
                Available Measurement History ({observations.length} Observations in {activeFilterYear === 'all' ? '2021–2025' : activeFilterYear})
              </h4>
            </div>

            {hasData ? (
              <div className="border border-[#E1E9E4] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F9F7] border-b border-[#E1E9E4] text-[#687873] uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Phase</th>
                      <th className="py-2.5 px-3">Parameter</th>
                      <th className="py-2.5 px-3 text-right">Observed Value</th>
                      <th className="py-2.5 px-3">Benchmark</th>
                      <th className="py-2.5 px-3">Screening Compliance</th>
                      <th className="py-2.5 px-3">Field Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9E4]">
                    {observations.map((obs) => (
                      <tr key={obs.id} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono tabular-nums font-medium text-[#172B27]">
                          {obs.date}
                        </td>
                        <td className="py-2.5 px-3 text-[#687873]">{obs.phase}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#172B27]">{obs.parameter}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#172B27]">
                          {obs.value} {obs.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#687873]">
                          {obs.benchmarkRule}
                        </td>
                        <td className="py-2.5 px-3">
                          {obs.isOutOfBenchmark ? (
                            <span className="font-semibold text-[#C94C4C] text-[11px]">
                              Out of Benchmark
                            </span>
                          ) : (
                            <span className="font-semibold text-[#23856D] text-[11px]">
                              Within Standard
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-[#687873] max-w-xs truncate" title={obs.fieldNotes}>
                          {obs.fieldNotes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#E1E9E4] space-y-2">
                <FileQuestion className="w-8 h-8 text-[#687873] mx-auto opacity-50" />
                <div className="text-sm font-bold text-[#172B27]">
                  No historical measurements on record for {activeFilterYear}
                </div>
                <p className="text-xs text-[#687873] max-w-md mx-auto leading-relaxed">
                  No verified observations are available for {ghat.name} in the selected period. Zero records cannot be interpreted as safety or compliance.
                </p>
              </div>
            )}
          </div>

          {/* Missing Data & Data Source Reference */}
          <div className="p-4 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4] text-xs text-[#687873] space-y-1.5">
            <div className="font-semibold text-[#172B27]">
              Dataset Quality & Sampling Governance
            </div>
            <div>
              Observations represent seasonal grab samples collected during Ganesh Utsav cycles. Missing records reflect intervals where sampling was not conducted at this specific site.
            </div>
            <div className="text-[11px] text-[#687873]/70">
              Reference: Central Pollution Control Board (CPCB) Designated Best Use Class B Criteria. Illustrative screening dataset for prototype evaluation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
