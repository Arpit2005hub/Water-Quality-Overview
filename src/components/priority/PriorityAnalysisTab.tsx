import React, { useState } from 'react';
import { dataService } from '../../services/dataService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface PriorityAnalysisTabProps {
  selectedYear: number | 'all';
}

export const PriorityAnalysisTab: React.FC<PriorityAnalysisTabProps> = ({ selectedYear }) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [activeGhatId, setActiveGhatId] = useState<string | null>(null);

  const priorityScores = dataService.getConfirmatoryPriorityMatrix(selectedYear);

  const filteredScores = priorityScores.filter((s) => {
    if (selectedTierFilter === 'all') return true;
    return s.priorityTier === selectedTierFilter;
  });

  const activeItem = activeGhatId
    ? priorityScores.find((s) => s.ghatId === activeGhatId) || priorityScores[0]
    : priorityScores[0];

  return (
    <div className="space-y-6">
      {/* Explicit Scientific Disclaimer */}
      <DisclaimerBanner
        text="The Confirmatory Priority Index is a screening heuristic for prioritizing municipal sampling and sensor resources based on historical exceedance frequency and basin sensitivity. It does not constitute an official regulatory penalty or legal violation notice."
        variant="screening"
      />

      {/* Top Screening Heuristic Explanation */}
      <div className="bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#172B27]">
              Multi-Criteria Confirmatory Testing Framework
            </h3>
            <p className="text-xs text-[#687873] mt-0.5">
              Identifies ghats where acute historical exceedances warrant enhanced surveillance and confirmatory testing.
              {selectedYear !== 'all' && ` Showing priority scores evaluated for ${selectedYear}.`}
            </p>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex items-center flex-wrap gap-1 p-1 bg-[#F7F9F7] rounded-lg border border-[#E1E9E4] shrink-0">
            <button
              onClick={() => setSelectedTierFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedTierFilter === 'all'
                  ? 'bg-white text-[#172B27] shadow-xs'
                  : 'text-[#687873] hover:text-[#172B27]'
              }`}
            >
              All Tiers ({priorityScores.length})
            </button>
            <button
              onClick={() => setSelectedTierFilter('High Confirmatory Priority')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedTierFilter === 'High Confirmatory Priority'
                  ? 'bg-white text-[#C94C4C] shadow-xs'
                  : 'text-[#687873] hover:text-[#C94C4C]'
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setSelectedTierFilter('Moderate Surveillance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedTierFilter === 'Moderate Surveillance'
                  ? 'bg-white text-[#D99A24] shadow-xs'
                  : 'text-[#687873] hover:text-[#D99A24]'
              }`}
            >
              Surveillance
            </button>
            <button
              onClick={() => setSelectedTierFilter('Routine Baseline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedTierFilter === 'Routine Baseline'
                  ? 'bg-white text-[#23856D] shadow-xs'
                  : 'text-[#687873] hover:text-[#23856D]'
              }`}
            >
              Baseline
            </button>
            {priorityScores.some((s) => !s.hasData) && (
              <button
                onClick={() => setSelectedTierFilter('Insufficient Data')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedTierFilter === 'Insufficient Data'
                    ? 'bg-white text-[#687873] shadow-xs'
                    : 'text-[#687873] hover:text-[#172B27]'
                }`}
              >
                No Data
              </button>
            )}
          </div>
        </div>

        {/* Scoring Methodology Breakdown Banner */}
        <div className="mt-4 p-3.5 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#172B27]">Exceedance Rate (40%)</span>
            <p className="text-[11px] text-[#687873]">Percentage of historical readings outside CPCB Class B.</p>
          </div>
          <div>
            <span className="font-semibold text-[#172B27]">Severe Hypoxia (20%)</span>
            <p className="text-[11px] text-[#687873]">Frequency of critical dissolved oxygen dips below 4.0 mg/L.</p>
          </div>
          <div>
            <span className="font-semibold text-[#172B27]">Organic Load (15%)</span>
            <p className="text-[11px] text-[#687873]">Occurrences of acute BOD surges above 6.0 mg/L.</p>
          </div>
          <div>
            <span className="font-semibold text-[#172B27]">Ecological Sensitivity (25%)</span>
            <p className="text-[11px] text-[#687873]">Bhojtal Ramsar site status or enclosed urban bathymetry.</p>
          </div>
        </div>
      </div>

      {/* Main Screening Layout: Ranked Matrix + Interactive Action Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Ghat Scores */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E9E4] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E1E9E4] bg-[#F7F9F7] flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B27] uppercase tracking-wider">
              Screening Priority Rankings
            </span>
            <span className="text-xs text-[#687873]">Click any row for technical action profile</span>
          </div>

          <div className="divide-y divide-[#E1E9E4]">
            {filteredScores.map((item) => {
              const isSelected = activeItem?.ghatId === item.ghatId;

              let tierColor = 'text-[#23856D] bg-[#E7F4EF]';
              let badgeText = 'Routine Baseline';
              if (!item.hasData) {
                tierColor = 'text-[#687873] bg-slate-100';
                badgeText = 'Insufficient Data';
              } else if (item.priorityTier === 'High Confirmatory Priority') {
                tierColor = 'text-[#C94C4C] bg-red-50';
                badgeText = 'High Priority';
              } else if (item.priorityTier === 'Moderate Surveillance') {
                tierColor = 'text-[#D99A24] bg-amber-50';
                badgeText = 'Moderate Surveillance';
              }

              return (
                <div
                  key={item.ghatId}
                  onClick={() => setActiveGhatId(item.ghatId)}
                  className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E7F4EF]/40 border-l-4 border-l-[#23856D]' : 'hover:bg-[#F7F9F7]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#172B27]">
                        {item.ghatName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${tierColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <div className="text-xs text-[#687873]">
                      {item.waterBody} · Exceedance Rate:{' '}
                      <strong className="font-mono">
                        {item.exceedanceRate !== null ? `${item.exceedanceRate}%` : 'N/A'}
                      </strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold font-mono tabular-nums text-[#172B27]">
                      {item.score !== null ? item.score : 'N/A'}
                    </div>
                    <div className="text-[10px] text-[#687873]">Priority Index</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ghat Actionable Profile Card */}
        {activeItem && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-[#E1E9E4] pb-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-[#687873] uppercase tracking-wide">
                    Actionable Priority Profile
                  </span>
                  <h4 className="text-lg font-bold text-[#172B27] mt-0.5">
                    {activeItem.ghatName}
                  </h4>
                  <div className="text-xs text-[#23856D] font-medium">
                    {activeItem.waterBody}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#687873]">Screening Score</span>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#172B27]">
                    {activeItem.score !== null ? `${activeItem.score}/100` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Technical Justification */}
              <div className="mb-4">
                <span className="text-xs font-bold text-[#172B27] uppercase tracking-wider">
                  Technical Screening Justification
                </span>
                <p className="text-xs text-[#687873] mt-1.5 leading-relaxed bg-[#F7F9F7] p-3 rounded-lg border border-[#E1E9E4]">
                  {activeItem.justification}
                </p>
              </div>

              {/* Sub-Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
                  <span className="text-[#687873] text-[11px]">Severe Hypoxia Dips (DO &lt; 4.0)</span>
                  <div className="font-bold font-mono tabular-nums text-[#172B27] text-sm mt-0.5">
                    {activeItem.hasData ? `${activeItem.severeHypoxiaCount} instances` : 'No data'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
                  <span className="text-[#687873] text-[11px]">Organic Surges (BOD &gt; 6.0)</span>
                  <div className="font-bold font-mono tabular-nums text-[#172B27] text-sm mt-0.5">
                    {activeItem.hasData ? `${activeItem.organicSurgeCount} instances` : 'No data'}
                  </div>
                </div>
              </div>

              {/* Recommended Field Actions */}
              <div>
                <span className="text-xs font-bold text-[#172B27] uppercase tracking-wider">
                  Recommended Confirmatory Interventions
                </span>
                <ul className="mt-2 space-y-2 text-xs">
                  {activeItem.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#172B27] leading-relaxed">
                      <ArrowRight className="w-3.5 h-3.5 text-[#23856D] mt-0.5 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E1E9E4] text-[11px] text-[#687873]">
              Screening heuristic for municipal resource allocation. Not an official regulatory declaration.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
