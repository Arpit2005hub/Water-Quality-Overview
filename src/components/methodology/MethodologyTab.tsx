import React from 'react';
import {
  CPCB_DESIGNATED_BEST_USE_CLASSES,
  CPCB_BENCHMARK_STANDARDS,
} from '../../data/cpcbStandards';
import { dataService } from '../../services/dataService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { Download, BookOpen, Layers, CheckCircle, AlertTriangle, FileCode } from 'lucide-react';

export const MethodologyTab: React.FC = () => {
  const allObservations = dataService.getObservations();

  const handleDownloadDataset = () => {
    dataService.triggerCSVDownload(allObservations, 'bhopal_visarjan_ghat_water_quality_dataset.csv');
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        text="Scientific methodology complies with Central Pollution Control Board (CPCB) guidelines for monitoring water bodies during idol immersion festivals."
        variant="methodology"
      />

      {/* Dataset Overview and Export Strip */}
      <div className="bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#23856D] uppercase tracking-wider">
            Dataset Governance & Prototype Transparency
          </div>
          <h3 className="text-base font-bold text-[#172B27] mt-0.5">
            Bhopal Visarjan Historical Screening Dataset (2021–2025 Archive)
          </h3>
          <p className="text-xs text-[#687873] mt-0.5">
            {allObservations.length} historical screening records across 7 cataloged Bhopal immersion locations, calibrated to CPCB Class B parameters for decision-support prototype demonstration.
          </p>
        </div>

        <button
          onClick={handleDownloadDataset}
          className="flex items-center gap-2 px-4 py-2 bg-[#23856D] hover:bg-[#155E63] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Historical Dataset (CSV)</span>
        </button>
      </div>

      {/* CPCB Designated Best Use Classification Table */}
      <div className="bg-white rounded-xl border border-[#E1E9E4] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E1E9E4]">
          <h3 className="text-base font-bold text-[#172B27]">
            CPCB Designated Best Use Water Quality Criteria
          </h3>
          <p className="text-xs text-[#687873] mt-0.5">
            Indian national water quality criteria formulated under the Water (Prevention and Control of Pollution) Act, 1974.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] border-b border-[#E1E9E4] text-[#687873] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Designated Best Use</th>
                <th className="py-3 px-4">Key Parametric Thresholds</th>
                <th className="py-3 px-4">Application to Bhopal Water Bodies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9E4]">
              {CPCB_DESIGNATED_BEST_USE_CLASSES.map((cls) => {
                const isPrimary = cls.classCategory.includes('Class B');

                return (
                  <tr
                    key={cls.classCategory}
                    className={`hover:bg-[#F7F9F7] ${
                      isPrimary ? 'bg-[#E7F4EF]/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#172B27]">
                        {cls.classCategory.split(' ')[0]} {cls.classCategory.split(' ')[1]}
                      </div>
                      {isPrimary && (
                        <div className="text-[10px] text-[#23856D] font-bold uppercase mt-0.5">
                          Active Benchmark
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[#172B27] max-w-xs">
                        {cls.designatedBestUse}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1 font-mono text-[11px] text-[#172B27]">
                        {cls.primaryCriteria.map((c, i) => (
                          <div key={i}>
                            <span className="text-[#687873]">{c.param}:</span>{' '}
                            <strong>{c.value}</strong>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#687873] text-xs max-w-sm">
                      {cls.regulatoryContext}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sampling Protocols & Analytical Methodologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sampling Protocol Timeline */}
        <div className="bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-[#172B27]">
              Festival Monitoring Sampling Schedule
            </h4>
            <p className="text-xs text-[#687873] mt-0.5">
              Standard CPCB 3-phase temporal sampling architecture for festival immersion cycles.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27] flex items-center justify-between">
                <span>Phase I: Pre-Visarjan (Baseline)</span>
                <span className="text-[#23856D] font-mono">T - 7 to 10 days</span>
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Establishes the ambient reference condition prior to festival activity. Reflects monsoon runoff inputs, lake circulation, and background microbial load.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27] flex items-center justify-between">
                <span>Phase II: During-Visarjan (Peak Load)</span>
                <span className="text-[#D99A24] font-mono">T = 0 (Visarjan Night)</span>
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Samples taken directly in the littoral immersion zone during peak immersion hours. Measures immediate oxygen drawdown and colloidal turbidity surge.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27] flex items-center justify-between">
                <span>Phase III: Post-Visarjan (Recovery & Decay)</span>
                <span className="text-[#C94C4C] font-mono">T + 24h, 72h, 7 days</span>
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Captures the microbial decomposition trajectory as submerged offerings, flowers, and idol binders exert biological oxygen demand.
              </p>
            </div>
          </div>
        </div>

        {/* Laboratory Analytical Techniques */}
        <div className="bg-white rounded-xl border border-[#E1E9E4] p-5 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-[#172B27]">
              Standard Laboratory Analytical Techniques
            </h4>
            <p className="text-xs text-[#687873] mt-0.5">
              Approved test procedures according to APHA Standard Methods and Bureau of Indian Standards (BIS).
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27]">
                Dissolved Oxygen (DO): Winkler Method with Azide Modification
              </div>
              <div className="text-[11px] text-[#23856D] font-mono mt-0.5">
                Standard Methods 4500-O C / IS 3025 (Part 38)
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Chemical fixation on-site using manganous sulfate and alkaline-iodide-azide reagent prevents nitrite interference prior to laboratory thiosulfate titration.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27]">
                Biochemical Oxygen Demand (BOD): 3-Day Incubation at 27°C
              </div>
              <div className="text-[11px] text-[#23856D] font-mono mt-0.5">
                IS 3025 (Part 44) Standard Indian Protocol
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Samples are diluted with nutrient-seeded water and incubated in dark BOD bottles at 27°C for 3 days. Depletion of DO measures organic decomposition potential.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F7F9F7] border border-[#E1E9E4]">
              <div className="font-bold text-[#172B27]">
                Turbidity: Nephelometric Ratio Method
              </div>
              <div className="text-[11px] text-[#23856D] font-mono mt-0.5">
                Standard Methods 2130 B (Formazin Calibration)
              </div>
              <p className="text-[#687873] mt-1 leading-relaxed">
                Measures 90-degree scattered light intensity from suspended particulate gypsum, clay silt, and paint pigments in Nephelometric Turbidity Units (NTU).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Limitations & Confounders Box */}
      <div className="bg-[#123B32] text-white p-5 rounded-xl border border-white/10 shadow-xs space-y-3 text-xs">
        <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Scientific Limitations & Confounding Environmental Factors</span>
        </div>
        <p className="text-white/80 leading-relaxed">
          1. <strong>Precipitation & Inflow Dilution:</strong> Heavy late-monsoon downpours (common in September across Madhya Pradesh) introduce high-volume freshwater dilution and stormwater runoff into Bhojtal, which may temporarily elevate DO through physical aeration or introduce background non-point source sediment.
        </p>
        <p className="text-white/80 leading-relaxed">
          2. <strong>Grab Sampling Heterogeneity:</strong> Discrete grab samples taken near ghat steps capture localized shoreline conditions and may exhibit higher sediment loading than open pelagic waters located 100 meters offshore.
        </p>
        <p className="text-white/80 leading-relaxed">
          3. <strong>Substrate Composition:</strong> Traditional Plaster of Paris (gypsum: CaSO₄·0.5H₂O) dissolves slowly over several months releasing calcium and sulfate ions, whereas natural clay (shadu mati) idols disintegrate within hours, causing acute initial turbidity spikes followed by rapid settlement.
        </p>
      </div>
    </div>
  );
};
