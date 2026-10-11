/**
 * Water Quality Data Models and TypeScript Interfaces
 * Visarjan Ghat Watch - Bhopal Water Quality Intelligence
 * Audited for scientific rigor, data transparency, and hackathon readiness
 */

export type WaterQualityParameter = 'DO' | 'BOD' | 'pH' | 'Turbidity' | 'TDS';

export type VisarjanPhase = 'Pre-Visarjan' | 'During-Visarjan' | 'Post-Visarjan';

export type DataQualityTier = 'Verified Lab Record' | 'Field Screening Sensor' | 'Composite Sample';

export type ConfirmatoryPriorityTier =
  | 'High Confirmatory Priority'
  | 'Moderate Surveillance'
  | 'Routine Baseline'
  | 'Insufficient Data';

export type CoverageLabel =
  | 'Comprehensive'
  | 'Adequate'
  | 'Sparse'
  | 'No Data Available'
  | 'No Records in Period';

export interface GhatInfo {
  id: string;
  name: string;
  waterBody: string;
  waterBodyType: 'Upper Lake (Bhojtal - Ramsar Site)' | 'Lower Lake (Chhota Talab)' | 'Urban Lake' | 'Reservoir';
  description: string;
  immersionInfrastructure: string;
  historicalContext: string;
  coordinatesApprox: string; // approximate reference area description (no fabricated GPS pins)
  establishedEcoPits: boolean;
  image?: string;
  imageCaption?: string;
  imageAttribution?: string;
  imageSourceUrl?: string;
}

export interface Observation {
  id: string;
  ghatId: string;
  ghatName: string;
  waterBody: string;
  date: string; // YYYY-MM-DD
  year: number;
  festival: 'Ganesh Utsav' | 'Durga Puja';
  phase: VisarjanPhase;
  parameter: WaterQualityParameter;
  value: number;
  unit: string;
  benchmarkRule: string; // e.g. "≥ 5.0 mg/L (CPCB Class B)"
  benchmarkThreshold: number | [number, number]; // 5.0 for DO, 3.0 for BOD, [6.5, 8.5] for pH
  isOutOfBenchmark: boolean;
  deviationPercent: number; // e.g. -24% (for DO deficit) or +120% (for BOD surge)
  dataQuality: DataQualityTier;
  labTechnique: string;
  fieldNotes: string;
}

export interface BenchmarkStandard {
  parameter: WaterQualityParameter;
  fullName: string;
  unit: string;
  cpcbClassBStandard: string;
  cpcbClassBThreshold: number | [number, number];
  comparisonOperator: 'gte' | 'lte' | 'between';
  scientificMeaning: string;
  environmentalImpact: string;
}

export interface GhatSummary {
  ghatId: string;
  ghatName: string;
  waterBody: string;
  totalRecords: number;
  validComparableReadings: number;
  outOfBenchmarkCount: number;
  outOfBenchmarkPercent: number | null; // null if validComparableReadings is 0
  coverageLabel: CoverageLabel;
  dateRange: string;
  priorityTier: ConfirmatoryPriorityTier;
  primaryParameterOfConcern: WaterQualityParameter | 'None Identified';
  maxBODObserved: number | null;
  minDOObserved: number | null;
  hasData: boolean;
  limitationNote?: string;
}

export interface OverallKPIs {
  totalGhatsInDataset: number;
  ghatsWithObservations: number;
  ghatsWithComparableReadings: number;
  totalRecords: number;
  validComparableReadings: number;
  outOfBenchmarkReadings: number;
  outOfBenchmarkPercentage: string | null; // e.g. "36.8" or null if 0 valid readings
  followUpReviewCandidates: number;
  ghatsWithInsufficientData: number;
}

export interface GlobalFilterState {
  year: number | 'all';
  ghatId: string | 'all';
  parameter: WaterQualityParameter | 'all';
  phase: VisarjanPhase | 'all';
  searchQuery: string;
}

export interface ConfirmatoryPriorityScore {
  ghatId: string;
  ghatName: string;
  waterBody: string;
  priorityTier: ConfirmatoryPriorityTier;
  score: number | null; // null if no data
  exceedanceRate: number | null; // %
  severeHypoxiaCount: number;
  organicSurgeCount: number;
  sampleCount: number;
  ecologicalSensitivity: 'High (Bhoj Wetland Ramsar)' | 'Moderate' | 'Urban Closed Basin';
  recommendedActions: string[];
  justification: string;
  hasData: boolean;
}
