import React, { useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { TrendingUp, ArrowDownRight, ArrowUpRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const HistoricalTrendsTab: React.FC = () => {
  const ghats = useMemo(() => dataService.getGhats(), []);
  const [selectedGhatId, setSelectedGhatId] = useState<string>('khatlapura');

  // Multi-year Pre vs Post Visarjan DO and BOD comparisons
  const years = [2021, 2022, 2023, 2024, 2025];

  const selectedGhat = ghats.find((g) => g.id === selectedGhatId) || ghats[0];

  const trendsData = years.map((yr) => {
    const obs = dataService.getObservations({ year: yr, ghatId: selectedGhatId });

    const preDO = obs.find((o) => o.phase === 'Pre-Visarjan' && o.parameter === 'DO')?.value ?? null;
    const postDO = obs.find((o) => o.phase === 'Post-Visarjan' && o.parameter === 'DO')?.value ?? null;
    const postBOD = obs.find((o) => o.phase === 'Post-Visarjan' && o.parameter === 'BOD')?.value ?? null;

    const doDrop = preDO !== null && postDO !== null ? (preDO - postDO).toFixed(1) : null;

    return {
      year: yr,
      hasRecords: obs.length > 0,
      preDO,
      postDO,
      postBOD,
      doDrop,
    };
  });

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        text="Pre/Post delta shifts quantify immediate festival immersion shock. Long-term trends evaluate the progressive introduction of artificial eco-immersion pits across Bhopal. Missing records indicate years without scheduled grab sampling."
        variant="screening"
      />

      {/* Case Study Highlight: Engineered Eco-Immersion Tanks vs Enclosed Natural Basin */}
      <div className="bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-semibold text-[#23856D] uppercase tracking-wider">
              Comparative Impact Analysis
            </div>
            <h3 className="text-lg font-bold text-[#172B27] mt-0.5">
              Historical Pre vs. Post-Visarjan Trends (2021–2025)
            </h3>
            <p className="text-xs text-[#687873] mt-0.5">
              Tracking oxygen sag (DO drawdown) and organic loading (BOD surge) across all 7 Bhopal immersion locations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#687873]">Focus Ghat:</span>
            <select
              value={selectedGhatId}
              onChange={(e) => setSelectedGhatId(e.target.value)}
              className="bg-[#F7F9F7] text-xs font-semibold text-[#172B27] border border-[#E1E9E4] rounded-lg px-3 py-1.5 focus:outline-hidden cursor-pointer"
            >
              {ghats.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.waterBody.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Narrative Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#F7F9F7] border border-[#E1E9E4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B27]">
                Khatlapura Ghat (Lower Lake)
              </span>
              <span className="text-[11px] font-semibold text-[#C94C4C] bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">
                Persistent Hypoxic Drawdown
              </span>
            </div>
            <p className="text-xs text-[#687873] leading-relaxed">
              Lower Lake’s compact storage volume (~1.5 MCM) and enclosed geometry mean organic immersion waste is not rapidly flushed out. In 2025, post-visarjan DO reached <strong>3.8 mg/L</strong> and BOD climbed to <strong>6.9 mg/L</strong>, exceeding the 3.0 mg/L benchmark.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#E7F4EF]/50 border border-[#23856D]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123B32]">
                Prempura Ghat (Upper Lake Eco-Pits)
              </span>
              <span className="text-[11px] font-semibold text-[#23856D] bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                Engineered Mitigation
              </span>
            </div>
            <p className="text-xs text-[#123B32]/80 leading-relaxed">
              Following NGT directives, large idols were routed into artificial concrete immersion retention ponds at Prempura. In 2024–2025, adjacent Bhojtal lake water maintained DO of <strong>5.4–5.6 mg/L</strong> post-visarjan, complying with CPCB Class B standards.
            </p>
          </div>
        </div>

        {/* Multi-Year Pre vs Post Comparison Data Table */}
        <div className="border border-[#E1E9E4] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] border-b border-[#E1E9E4] text-[#687873] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Festival Year</th>
                <th className="py-3 px-4">Ghat Profile</th>
                <th className="py-3 px-4 text-right">Pre-Visarjan DO</th>
                <th className="py-3 px-4 text-right">Post-Visarjan DO</th>
                <th className="py-3 px-4 text-right">Oxygen Sag (Delta)</th>
                <th className="py-3 px-4 text-right">Post-Visarjan BOD</th>
                <th className="py-3 px-4">CPCB Benchmark Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E4]">
              {trendsData.map((row) => {
                const isOutOfBenchmark =
                  row.postDO !== null &&
                  (row.postDO < 5.0 || (row.postBOD !== null && row.postBOD > 3.0));

                return (
                  <tr key={row.year} className="hover:bg-[#F7F9F7]/60">
                    <td className="py-3 px-4 font-mono font-bold text-[#172B27]">
                      {row.year}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#172B27]">
                      {selectedGhat.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#172B27]">
                      {row.preDO !== null ? `${row.preDO} mg/L` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#172B27]">
                      {row.postDO !== null ? `${row.postDO} mg/L` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {row.doDrop !== null ? (
                        <span className="text-[#C94C4C] font-semibold">
                          -{row.doDrop} mg/L
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#172B27]">
                      {row.postBOD !== null ? `${row.postBOD} mg/L` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {row.hasRecords ? (
                        row.postDO !== null ? (
                          isOutOfBenchmark ? (
                            <span className="text-[#C94C4C] font-semibold flex items-center gap-1">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>Out of Benchmark</span>
                            </span>
                          ) : (
                            <span className="text-[#23856D] font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Compliant (Class B)</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[#687873]">Partial records</span>
                        )
                      ) : (
                        <span className="text-amber-800 font-medium italic text-[11px]">
                          No data available (N/A)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E1E9E4] text-[11px] text-[#687873]">
          Note: Benchmark criteria: Dissolved Oxygen ≥ 5.0 mg/L · Biochemical Oxygen Demand ≤ 3.0 mg/L (CPCB Designated Best Use Class B).
        </div>
      </div>
    </div>
  );
};
