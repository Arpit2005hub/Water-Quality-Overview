import React, { useState } from 'react';
import { Observation } from '../../types/waterQuality';
import { dataService } from '../../services/dataService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { MetricCard } from '../common/MetricCard';
import { ParameterChart } from './ParameterChart';
import { GhatBarChart } from './GhatBarChart';
import { ObservationsTable } from './ObservationsTable';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface OverviewTabProps {
  observations: Observation[];
  selectedYear: number | 'all';
  onResetFilters?: () => void;
  onNavigateToGhats?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  observations,
  selectedYear,
  onResetFilters,
}) => {
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  const kpis = dataService.getOverallKPIs(observations);

  return (
    <div className="space-y-5">
      {/* 1. Compact Dashboard Header Bar */}
      <div className="bg-white rounded-md border border-[#DCE7E2] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#416B64]">
              Platform Overview
            </span>
            <span className="text-xs text-[#343B38]/40">·</span>
            <span className="text-xs text-[#343B38]/80 font-medium">
              {selectedYear === 'all'
                ? 'Historical Archive (2021–2025)'
                : `${selectedYear} Monitoring Observations`}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#24473D] mt-0.5">
            Visarjan Ghat Watch · Bhopal Water Intelligence
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F5F0] border border-[#DCE7E2] text-[#343B38]/80 font-medium">
            <Database className="w-3.5 h-3.5 text-[#416B64]" />
            <span>Dataset: Illustrative Demo (CPCB Class B)</span>
          </div>
          {onResetFilters && selectedYear !== 'all' && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#DCE7E2] bg-white text-[#24473D] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#416B64]" />
              <span>Reset to All Years</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Data Transparency Notice */}
      <DisclaimerBanner
        text="DATA TRANSPARENCY NOTICE: Historical Screening Prototype using Illustrative Demo Data calibrated against CPCB Class B parameters for hackathon evaluation. Not an official government dashboard or live sensor telemetry stream."
        variant="screening"
      />

      {/* 2. Modest Photographic Introduction */}
      <div className="bg-white rounded-md border border-[#DCE7E2] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
          <div className="md:col-span-4 relative bg-[#F5F5F0] min-h-[170px] md:min-h-[190px] border-b md:border-b-0 md:border-r border-[#DCE7E2]">
            <img
              src="/src/assets/images/bhopal_upper_lake_bhojtal.jpg"
              alt="Upper Lake (Bhojtal), Bhopal viewed across water towards Takia Taapu"
              className="w-full h-full object-cover max-h-[220px]"
              loading="lazy"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white p-2 text-[10px] leading-tight backdrop-blur-2xs">
              <div>Bhojtal (Upper Lake), Bhopal · Takia Taapu island vista</div>
              <div className="text-white/70 text-[9px] mt-0.5 flex items-center justify-between">
                <span>Photo: Aman Gupta (CC BY-SA 3.0)</span>
                <a
                  href="https://commons.wikimedia.org/wiki/File:Upper_Lake,_Bhopal.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-0.5 text-white/90"
                >
                  <span>Wikimedia</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#416B64]">
                Environmental Field Context
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#24473D] mt-0.5">
                Understanding Bhopal's Urban Water Bodies
              </h2>
              <p className="text-xs sm:text-sm text-[#343B38]/85 mt-1 leading-relaxed">
                Explore available historical water-quality observations, compare monitoring locations, and identify where further environmental assessment may be needed.
              </p>
              <p className="text-xs text-[#343B38]/70 mt-2 leading-relaxed">
                Ritual visarjan (idol immersion) events introduce concentrated organic matter, flowers (nirmalya), and plaster materials into local lake basins. This dashboard analyzes historical screening indicators—particularly Dissolved Oxygen drawdown and Biochemical Oxygen Demand surges—across 7 cataloged immersion ghats.
              </p>
            </div>

            <div className="pt-2 border-t border-[#DCE7E2] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#343B38]/70">
              <span>Benchmark Standard: CPCB Designated Best Use (Class B Outdoor Bathing & Immersion)</span>
              <span className="font-medium text-[#24473D]">DO ≥ 5.0 mg/L · BOD ≤ 3.0 mg/L · pH 6.5–8.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact 4-Metric Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Ghats in dataset */}
        <MetricCard
          label="Ghats in Dataset"
          value={kpis.totalGhatsInDataset}
          subtext="Cataloged Bhopal immersion sites"
          icon={Compass}
          indicatorText="7 Known Sites"
          indicatorVariant="neutral"
        />

        {/* 2. Ghats with observations */}
        <MetricCard
          label="Ghats with Observations"
          value={kpis.ghatsWithObservations}
          subtext={
            selectedYear === 'all'
              ? `${kpis.ghatsWithObservations} of 7 sites with archive records`
              : `${kpis.ghatsWithObservations} of 7 sites sampled in ${selectedYear}`
          }
          icon={MapPin}
          indicatorText={`${kpis.ghatsWithObservations} / ${kpis.totalGhatsInDataset}`}
          indicatorVariant={
            kpis.ghatsWithObservations === kpis.totalGhatsInDataset ? 'positive' : 'warning'
          }
        />

        {/* 3. Valid comparable readings */}
        <MetricCard
          label="Valid Comparable Readings"
          value={kpis.validComparableReadings}
          subtext={
            kpis.totalRecords > 0
              ? `${kpis.validComparableReadings} of ${kpis.totalRecords} records match CPCB criteria`
              : '0 records in selected period'
          }
          icon={CheckCircle2}
          indicatorText="CPCB Class B"
          indicatorVariant={kpis.validComparableReadings > 0 ? 'positive' : 'neutral'}
        />

        {/* 4. Out-of-benchmark readings */}
        <MetricCard
          label="Out-of-Benchmark Readings"
          value={
            kpis.validComparableReadings > 0
              ? `${kpis.outOfBenchmarkReadings}`
              : 'N/A'
          }
          subtext={
            kpis.outOfBenchmarkPercentage !== null
              ? `${kpis.outOfBenchmarkPercentage}% exceedance rate`
              : 'N/A (0 comparable readings)'
          }
          icon={AlertTriangle}
          indicatorText={
            kpis.outOfBenchmarkPercentage !== null
              ? `${kpis.outOfBenchmarkPercentage}%`
              : 'N/A'
          }
          indicatorVariant={
            kpis.outOfBenchmarkPercentage === null
              ? 'neutral'
              : Number(kpis.outOfBenchmarkPercentage) > 40
              ? 'alert'
              : Number(kpis.outOfBenchmarkPercentage) > 20
              ? 'warning'
              : 'positive'
          }
        />
      </div>

      {/* 4. Two-Column Analytical Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <ParameterChart observations={observations} />
        </div>
        <div className="xl:col-span-5">
          <GhatBarChart selectedYear={selectedYear} />
        </div>
      </div>

      {/* 5. Section 7: About Bhopal's Lakes Context Section */}
      <div className="bg-white rounded-md border border-[#DCE7E2] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE7E2] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#24473D] uppercase tracking-wide">
              About Bhopal's Lakes
            </h3>
            <p className="text-xs text-[#343B38]/70 mt-0.5">
              Hydrological overview of Upper Lake (Bhojtal) and Lower Lake (Chhota Talab).
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F0] border border-[#DCE7E2] text-[#343B38]/80 font-medium self-start sm:self-auto">
            Ecological Background
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          <div className="md:col-span-4 rounded overflow-hidden border border-[#DCE7E2] bg-[#F5F5F0] relative min-h-[160px]">
            <img
              src="/src/assets/images/bhopal_lower_lake_chhota_talab.jpg"
              alt="Lower Lake (Chhota Talab), Bhopal urban water body"
              className="w-full h-full object-cover min-h-[160px]"
              loading="lazy"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white p-2 text-[10px] leading-tight backdrop-blur-2xs">
              <div>Lower Lake (Chhota Talab), Bhopal</div>
              <div className="text-white/70 text-[9px] mt-0.5 flex items-center justify-between">
                <span>Photo: Masterblaster3r (CC BY-SA 4.0)</span>
                <a
                  href="https://commons.wikimedia.org/wiki/File:Lower_lake_Bhopal.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-0.5 text-white/90"
                >
                  <span>Wikimedia</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 text-xs leading-relaxed text-[#343B38]/85">
            <p>
              Upper Lake and Lower Lake are prominent interconnected urban water bodies in Bhopal. Together, they constitute the Bhoj Wetland, designated as a Ramsar site of international importance in 2002.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#F5F5F0] rounded border border-[#DCE7E2] space-y-1">
                <div className="font-bold text-[#24473D]">Upper Lake (Bhojtal)</div>
                <p className="text-[11px] text-[#343B38]/75">
                  Created in the 11th century by Raja Bhoj across the Kolans River. Surface area ~31 km² with storage capacity of ~101 MCM. Serves as a primary drinking water source and features engineered eco-immersion pits (Prempura) to reduce direct open-lake loading.
                </p>
              </div>

              <div className="p-3 bg-[#F5F5F0] rounded border border-[#DCE7E2] space-y-1">
                <div className="font-bold text-[#24473D]">Lower Lake (Chhota Talab)</div>
                <p className="text-[11px] text-[#343B38]/75">
                  Constructed in 1794 in the historic old city. Surface area ~1.29 km² with storage of ~1.5 MCM. Its enclosed urban basin and lower water volume result in slower flushing, making it more vulnerable to festival organic loading at Khatlapura Ghat.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[#DCE7E2]/40 rounded border border-[#6D9189]/40 text-[11px] text-[#24473D]">
              <strong>Methodological Distinction:</strong> General photographic depictions illustrate geographic setting only and are not scientific evidence of water quality. Water-quality assessments in this platform rely exclusively on numerical chemical parameters (DO, BOD, pH) compared to established CPCB standards.
            </div>
          </div>
        </div>
      </div>

      {/* 6. Observations Table */}
      <div>
        <ObservationsTable
          observations={observations}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* 7. Data Audit & Metric Definitions Collapsible */}
      <div className="bg-white rounded-md border border-[#DCE7E2] overflow-hidden">
        <button
          onClick={() => setShowAuditDetails(!showAuditDetails)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F5F5F0] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#416B64] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#24473D]">
              Data Audit & Metric Definitions: How KPIs Are Calculated & Zero Records Handled
            </span>
            <span className="text-[11px] bg-[#DCE7E2] text-[#24473D] font-semibold px-2 py-0.5 rounded hidden sm:inline">
              Transparency
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#416B64]">
            <span>{showAuditDetails ? 'Hide Audit' : 'View Audit'}</span>
            {showAuditDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showAuditDetails && (
          <div className="p-4 border-t border-[#DCE7E2] bg-[#F5F5F0]/60 space-y-3.5 text-xs text-[#343B38] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded border border-[#DCE7E2]">
                <div className="font-bold text-[#24473D] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#416B64]" />
                  <span>1. Total Ghats in Catalog ({kpis.totalGhatsInDataset})</span>
                </div>
                <p className="text-[#343B38]/70 mt-1 text-[11px]">
                  Fixed count of recognized immersion locations in Bhopal: Khatlapura, Sheetaldas Ki Bagiya, Prempura, Sant Hirdaram Nagar, Shahpura Lake, Hathikheda Reservoir, and Kaliasot Reservoir.
                </p>
              </div>

              <div className="p-3 bg-white rounded border border-[#DCE7E2]">
                <div className="font-bold text-[#24473D] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#416B64]" />
                  <span>2. Ghats with Records ({kpis.ghatsWithObservations})</span>
                </div>
                <p className="text-[#343B38]/70 mt-1 text-[11px]">
                  Unique ghats that have ≥1 observation in the active filter ({selectedYear === 'all' ? 'All 2021–2025' : selectedYear}). {kpis.ghatsWithInsufficientData > 0 ? `${kpis.ghatsWithInsufficientData} sites have no records in this period.` : 'All sites have records.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded border border-[#DCE7E2]">
                <div className="font-bold text-[#24473D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#416B64]" />
                  <span>3. Valid Comparable Readings ({kpis.validComparableReadings})</span>
                </div>
                <p className="text-[#343B38]/70 mt-1 text-[11px]">
                  Observations with non-null numeric values and an applicable CPCB Class B standard (DO, BOD, pH, Turbidity). Excludes unstandardized field notes.
                </p>
              </div>

              <div className="p-3 bg-white rounded border border-[#DCE7E2]">
                <div className="font-bold text-[#24473D] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B33939]" />
                  <span>4. Zero-Record Policy</span>
                </div>
                <p className="text-[#343B38]/70 mt-1 text-[11px]">
                  <strong>Zero records ≠ 0% exceedance.</strong> When a ghat has 0 records, exceedance is reported as <strong>N/A</strong> and status as <strong>Insufficient Data</strong>. Lack of observations never implies safety.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[#DCE7E2]/50 rounded border border-[#416B64]/30 text-[11px] text-[#24473D]">
              <strong>Demo Data Calibration:</strong> This prototype evaluates an illustrative dataset structured around CPCB Designated Best Use Class B criteria. It is designed for hackathon decision-support demonstration and must not be used for municipal enforcement or regulatory compliance.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
