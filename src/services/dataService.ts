import {
  GhatInfo,
  Observation,
  GhatSummary,
  OverallKPIs,
  GlobalFilterState,
  ConfirmatoryPriorityScore,
  WaterQualityParameter,
  CoverageLabel,
} from '../types/waterQuality';
import { BHOPAL_GHATS, RAW_OBSERVATIONS } from '../data/waterQualityData';
import { CPCB_BENCHMARK_STANDARDS } from '../data/cpcbStandards';

class DataService {
  private ghats: GhatInfo[] = [...BHOPAL_GHATS];
  private observations: Observation[] = [...RAW_OBSERVATIONS];
  public readonly isDemoDataset: boolean = true; // Transparently labeled as demo screening data
  public readonly dataSourceName: string = 'Illustrative Historical Screening Dataset (Calibrated against CPCB Class B Standards)';

  public getGhats(): GhatInfo[] {
    return [...this.ghats];
  }

  public getGhatById(id: string): GhatInfo | undefined {
    return this.ghats.find((g) => g.id === id);
  }

  public getAvailableYears(): number[] {
    const years = Array.from(new Set(this.observations.map((o) => o.year)));
    return years.sort((a, b) => b - a);
  }

  public getObservations(filters?: Partial<GlobalFilterState>): Observation[] {
    let result = [...this.observations];

    if (!filters) return result;

    if (filters.year && filters.year !== 'all') {
      result = result.filter((o) => o.year === filters.year);
    }

    if (filters.ghatId && filters.ghatId !== 'all') {
      result = result.filter((o) => o.ghatId === filters.ghatId);
    }

    if (filters.parameter && filters.parameter !== 'all') {
      result = result.filter((o) => o.parameter === filters.parameter);
    }

    if (filters.phase && filters.phase !== 'all') {
      result = result.filter((o) => o.phase === filters.phase);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.ghatName.toLowerCase().includes(q) ||
          o.parameter.toLowerCase().includes(q) ||
          o.waterBody.toLowerCase().includes(q) ||
          o.fieldNotes.toLowerCase().includes(q) ||
          o.date.includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Calculates comprehensive KPIs with strictly separated metrics:
   * - Total ghats in catalog
   * - Ghats with observations in active filter
   * - Valid comparable readings (verified CPCB benchmark)
   * - Out-of-benchmark count and percentage (percentage is null if denominator is 0)
   * - Follow-up review candidates
   */
  public getOverallKPIs(obsList: Observation[]): OverallKPIs {
    const totalGhatsInDataset = this.ghats.length; // Always 7 recognized Bhopal immersion locations
    const ghatsWithObsSet = new Set(obsList.map((o) => o.ghatId));
    const ghatsWithObservations = ghatsWithObsSet.size;

    const totalRecords = obsList.length;

    // Valid comparable readings are those where a verified numeric benchmark applies
    const validComparable = obsList.filter((o) => {
      const std = CPCB_BENCHMARK_STANDARDS[o.parameter];
      return !!std && typeof o.value === 'number' && !isNaN(o.value);
    });

    const ghatsWithComparableReadings = new Set(validComparable.map((o) => o.ghatId)).size;

    const outOfBenchmark = validComparable.filter((o) => o.isOutOfBenchmark);

    // Percentage formula: (out of benchmark / valid comparable) * 100
    // Returns null if denominator is 0
    const outOfBenchmarkPercentage =
      validComparable.length > 0
        ? ((outOfBenchmark.length / validComparable.length) * 100).toFixed(1)
        : null;

    // Follow-up review candidates:
    // Ghats with valid readings where exceedance share >= 40% OR observed severe hypoxia (DO < 4.0 mg/L)
    const ghatViolationMap = new Map<string, { total: number; outCount: number; severeHypoxia: boolean }>();

    validComparable.forEach((o) => {
      const current = ghatViolationMap.get(o.ghatId) || { total: 0, outCount: 0, severeHypoxia: false };
      current.total += 1;
      if (o.isOutOfBenchmark) current.outCount += 1;
      if (o.parameter === 'DO' && o.value < 4.0) current.severeHypoxia = true;
      ghatViolationMap.set(o.ghatId, current);
    });

    let followUpCount = 0;
    ghatViolationMap.forEach((val) => {
      if (val.total > 0) {
        const rate = (val.outCount / val.total) * 100;
        if (rate >= 40 || val.severeHypoxia) {
          followUpCount += 1;
        }
      }
    });

    const ghatsWithInsufficientData = totalGhatsInDataset - ghatsWithObservations;

    return {
      totalGhatsInDataset,
      ghatsWithObservations,
      ghatsWithComparableReadings,
      totalRecords,
      validComparableReadings: validComparable.length,
      outOfBenchmarkReadings: outOfBenchmark.length,
      outOfBenchmarkPercentage,
      followUpReviewCandidates: followUpCount,
      ghatsWithInsufficientData,
    };
  }

  /**
   * Generates summary for all cataloged ghats with zero-record handling.
   * If a ghat has 0 records in the period, outOfBenchmarkPercent is null (displayed as 'N/A')
   * and priorityTier is 'Insufficient Data' (never falsely labeled safe or 0%!).
   */
  public getGhatSummaries(yearFilter: number | 'all' = 'all'): GhatSummary[] {
    const obs = this.getObservations({ year: yearFilter });

    return this.ghats.map((ghat) => {
      const ghatObs = obs.filter((o) => o.ghatId === ghat.id);
      const validReadings = ghatObs.filter(
        (o) => !!CPCB_BENCHMARK_STANDARDS[o.parameter] && typeof o.value === 'number' && !isNaN(o.value)
      );
      const outOfBenchmark = validReadings.filter((o) => o.isOutOfBenchmark);

      const hasData = validReadings.length > 0;

      // Mathematical percentage: null if denominator is 0
      const percent = hasData
        ? Math.round((outOfBenchmark.length / validReadings.length) * 100)
        : null;

      const doReadings = validReadings.filter((o) => o.parameter === 'DO').map((o) => o.value);
      const bodReadings = validReadings.filter((o) => o.parameter === 'BOD').map((o) => o.value);

      const minDO = doReadings.length > 0 ? Math.min(...doReadings) : null;
      const maxBOD = bodReadings.length > 0 ? Math.max(...bodReadings) : null;

      // Date range calculation with explicit 'No data available' for zero records
      const dates = ghatObs.map((o) => o.date).sort();
      let dateRange = 'No data available';
      if (dates.length > 1) {
        dateRange = `${dates[0]} – ${dates[dates.length - 1]}`;
      } else if (dates.length === 1) {
        dateRange = dates[0];
      }

      // Coverage label with explicit zero-record handling
      let coverageLabel: CoverageLabel = 'No Data Available';
      if (ghatObs.length >= 8) coverageLabel = 'Comprehensive';
      else if (ghatObs.length >= 4) coverageLabel = 'Adequate';
      else if (ghatObs.length > 0) coverageLabel = 'Sparse';

      // Priority tier calculation
      let priorityTier: 'High Confirmatory Priority' | 'Moderate Surveillance' | 'Routine Baseline' | 'Insufficient Data' = 'Insufficient Data';
      let primaryConcern: WaterQualityParameter | 'None Identified' = 'None Identified';

      if (!hasData) {
        priorityTier = 'Insufficient Data';
      } else {
        if ((percent !== null && percent >= 50) || (minDO !== null && minDO < 4.0) || (maxBOD !== null && maxBOD > 7.0)) {
          priorityTier = 'High Confirmatory Priority';
        } else if ((percent !== null && percent >= 25) || (maxBOD !== null && maxBOD > 4.5)) {
          priorityTier = 'Moderate Surveillance';
        } else {
          priorityTier = 'Routine Baseline';
        }

        if (minDO !== null && minDO < 4.0) primaryConcern = 'DO';
        else if (maxBOD !== null && maxBOD > 3.0) primaryConcern = 'BOD';
      }

      const limitationNote = !hasData
        ? `No observations recorded for ${ghat.name} in the ${yearFilter === 'all' ? 'entire' : yearFilter} dataset. Do not infer safety or compliance without measurements.`
        : undefined;

      return {
        ghatId: ghat.id,
        ghatName: ghat.name,
        waterBody: ghat.waterBody,
        totalRecords: ghatObs.length,
        validComparableReadings: validReadings.length,
        outOfBenchmarkCount: outOfBenchmark.length,
        outOfBenchmarkPercent: percent,
        coverageLabel,
        dateRange,
        priorityTier,
        primaryParameterOfConcern: primaryConcern,
        maxBODObserved: maxBOD,
        minDOObserved: minDO,
        hasData,
        limitationNote,
      };
    });
  }

  public getGhatComparisonData(
    metric: 'outOfBenchmarkPercent' | 'outOfBenchmarkCount' | 'validReadings',
    yearFilter: number | 'all' = 'all'
  ) {
    const summaries = this.getGhatSummaries(yearFilter);

    const items = summaries.map((s) => {
      let value = 0;
      let formatted = 'N/A';
      const hasMetricData = s.hasData;

      if (metric === 'outOfBenchmarkPercent') {
        if (s.outOfBenchmarkPercent !== null) {
          value = s.outOfBenchmarkPercent;
          formatted = `${s.outOfBenchmarkPercent}%`;
        } else {
          value = -1; // Sort unrecorded at the bottom
          formatted = 'N/A';
        }
      } else if (metric === 'outOfBenchmarkCount') {
        value = s.outOfBenchmarkCount;
        formatted = `${s.outOfBenchmarkCount} readings`;
      } else {
        value = s.validComparableReadings;
        formatted = `${s.validComparableReadings} readings`;
      }

      return {
        ghatId: s.ghatId,
        ghatName: s.ghatName,
        waterBody: s.waterBody,
        value,
        formatted,
        numerator: s.outOfBenchmarkCount,
        denominator: s.validComparableReadings,
        percentage: s.outOfBenchmarkPercent,
        hasData: hasMetricData,
        period: yearFilter === 'all' ? '2021–2025 Aggregate' : `${yearFilter} Dataset`,
      };
    });

    // Consistent ranking: descending, placing N/A at the bottom
    return items.sort((a, b) => b.value - a.value);
  }

  public getConfirmatoryPriorityMatrix(yearFilter: number | 'all' = 'all'): ConfirmatoryPriorityScore[] {
    const obs = this.getObservations({ year: yearFilter });

    return this.ghats.map((ghat) => {
      const gObs = obs.filter((o) => o.ghatId === ghat.id);
      const valid = gObs.filter(
        (o) => !!CPCB_BENCHMARK_STANDARDS[o.parameter] && typeof o.value === 'number' && !isNaN(o.value)
      );

      // Handle zero records
      if (valid.length === 0) {
        return {
          ghatId: ghat.id,
          ghatName: ghat.name,
          waterBody: ghat.waterBody,
          priorityTier: 'Insufficient Data' as const,
          score: null,
          exceedanceRate: null,
          severeHypoxiaCount: 0,
          organicSurgeCount: 0,
          sampleCount: 0,
          ecologicalSensitivity: (ghat.waterBodyType === 'Upper Lake (Bhojtal - Ramsar Site)'
            ? 'High (Bhoj Wetland Ramsar)'
            : 'Moderate') as 'High (Bhoj Wetland Ramsar)' | 'Moderate' | 'Urban Closed Basin',
          recommendedActions: [
            'Schedule baseline grab sampling during festival periods',
            'Verify historical sampling coverage with municipal testing records',
            'Do not interpret missing observations as zero risk',
          ],
          justification: 'No measurements available in the selected filter period. Screening index cannot be evaluated without empirical data.',
          hasData: false,
        };
      }

      const outOfBenchmark = valid.filter((o) => o.isOutOfBenchmark);
      const exceedanceRate = (outOfBenchmark.length / valid.length) * 100;
      const severeHypoxiaCount = valid.filter((o) => o.parameter === 'DO' && o.value < 4.0).length;
      const organicSurgeCount = valid.filter((o) => o.parameter === 'BOD' && o.value >= 6.0).length;

      // Sensitivity factor
      let sensitivity: 'High (Bhoj Wetland Ramsar)' | 'Moderate' | 'Urban Closed Basin' = 'Moderate';
      let sensitivityScore = 20;

      if (ghat.waterBodyType === 'Upper Lake (Bhojtal - Ramsar Site)') {
        sensitivity = 'High (Bhoj Wetland Ramsar)';
        sensitivityScore = 30; // Drinking water supply + Ramsar wetland
      } else if (ghat.waterBodyType === 'Lower Lake (Chhota Talab)') {
        sensitivity = 'Urban Closed Basin';
        sensitivityScore = 28; // Enclosed hydrologic basin with low flush volume
      } else if (ghat.waterBody === 'Shahpura Lake') {
        sensitivity = 'Urban Closed Basin';
        sensitivityScore = 25;
      }

      // Compute index (0 to 100)
      const hypoxiaScore = Math.min(severeHypoxiaCount * 10, 20);
      const organicScore = Math.min(organicSurgeCount * 8, 15);
      const rawScore = (exceedanceRate * 0.4) + hypoxiaScore + organicScore + (sensitivityScore * 0.8);
      const score = Math.min(Math.round(rawScore), 100);

      let priorityTier: 'High Confirmatory Priority' | 'Moderate Surveillance' | 'Routine Baseline' = 'Routine Baseline';
      if (score >= 60 || severeHypoxiaCount >= 2 || exceedanceRate >= 60) {
        priorityTier = 'High Confirmatory Priority';
      } else if (score >= 35 || exceedanceRate >= 30) {
        priorityTier = 'Moderate Surveillance';
      }

      const recommendedActions: string[] = [];
      if (priorityTier === 'High Confirmatory Priority') {
        recommendedActions.push('Deploy automated multi-parameter sonde 48h prior to and 96h post-visarjan');
        recommendedActions.push('Mandate diversion of community idols to off-stream artificial retention tanks');
        recommendedActions.push('Collect sediment core samples for heavy metal (lead, chrome, cadmium) screening');
      } else if (priorityTier === 'Moderate Surveillance') {
        recommendedActions.push('Increase post-immersion grab sampling frequency to 24h, 48h, and 7d');
        recommendedActions.push('Enforce strict nirmalya (organic offering) separation nets');
      } else {
        recommendedActions.push('Maintain standard pre/post CPCB screening protocols');
        recommendedActions.push('Periodic baseline verification during monsoon inflow');
      }

      let justification = '';
      if (ghat.id === 'khatlapura') {
        justification = 'Enclosed Lower Lake catchment with high historical exceedance rate and repeated hypoxic dips below 4.0 mg/L.';
      } else if (ghat.id === 'shahpura') {
        justification = 'Severe urban eutrophication backdrop amplifying BOD surges during organic immersion degradation.';
      } else if (ghat.id === 'sheetaldas') {
        justification = 'Direct frontage onto Upper Lake drinking water catchment; sensitive ecological boundary requiring ongoing protection.';
      } else if (ghat.id === 'prempura') {
        justification = 'Successful mitigation via engineered eco-immersion pits demonstrates compliant open-lake readings; routine surveillance advised.';
      } else {
        justification = 'Moderate basin capacity with limited severe hypoxia events in available historical records.';
      }

      return {
        ghatId: ghat.id,
        ghatName: ghat.name,
        waterBody: ghat.waterBody,
        priorityTier,
        score,
        exceedanceRate: Math.round(exceedanceRate),
        severeHypoxiaCount,
        organicSurgeCount,
        sampleCount: valid.length,
        ecologicalSensitivity: sensitivity,
        recommendedActions,
        justification,
        hasData: true,
      };
    }).sort((a, b) => {
      // Sort items with data first, then by score descending
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
  }

  public exportToCSV(observations: Observation[]): string {
    const headers = [
      'Observation ID',
      'Date',
      'Year',
      'Festival',
      'Phase',
      'Ghat Name',
      'Water Body',
      'Parameter',
      'Observed Value',
      'Unit',
      'Benchmark Standard',
      'Out of Benchmark',
      'Data Quality Tier',
      'Testing Technique',
      'Field Notes',
    ];

    const rows = observations.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      o.year,
      `"${o.festival}"`,
      `"${o.phase}"`,
      `"${o.ghatName}"`,
      `"${o.waterBody}"`,
      `"${o.parameter}"`,
      o.value,
      `"${o.unit}"`,
      `"${o.benchmarkRule}"`,
      o.isOutOfBenchmark ? 'YES' : 'NO',
      `"${o.dataQuality}"`,
      `"${o.labTechnique}"`,
      `"${o.fieldNotes.replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public triggerCSVDownload(observations: Observation[], filename = 'visarjan_ghat_water_quality.csv') {
    const csvContent = this.exportToCSV(observations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Reloads dataset from internal cache.
   * Transparently returns metadata indicating it is demo data, not live telemetry.
   */
  public reloadDataset(): Promise<{ success: boolean; message: string; recordCount: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.observations = [...RAW_OBSERVATIONS];
        resolve({
          success: true,
          message: 'Dataset reloaded from local historical screening cache. (Demo data mode — no live government telemetry connected).',
          recordCount: this.observations.length,
        });
      }, 350);
    });
  }
}

export const dataService = new DataService();
