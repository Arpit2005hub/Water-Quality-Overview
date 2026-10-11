import { BenchmarkStandard } from '../types/waterQuality';

export const CPCB_BENCHMARK_STANDARDS: Record<string, BenchmarkStandard> = {
  DO: {
    parameter: 'DO',
    fullName: 'Dissolved Oxygen',
    unit: 'mg/L',
    cpcbClassBStandard: '≥ 5.0 mg/L',
    cpcbClassBThreshold: 5.0,
    comparisonOperator: 'gte',
    scientificMeaning: 'Quantity of free, non-compound oxygen dissolved in water, essential for aerobic aquatic organisms, fish breathing, and natural biodegradation of wastes.',
    environmentalImpact: 'Depletion below 5.0 mg/L stresses aquatic organisms; levels below 4.0 mg/L create hypoxic conditions causing fish asphyxiation and favoring anaerobic decay producing foul odors.',
  },
  BOD: {
    parameter: 'BOD',
    fullName: 'Biochemical Oxygen Demand (3-day at 27°C)',
    unit: 'mg/L',
    cpcbClassBStandard: '≤ 3.0 mg/L',
    cpcbClassBThreshold: 3.0,
    comparisonOperator: 'lte',
    scientificMeaning: 'Amount of dissolved oxygen consumed by aerobic microorganisms while decomposing organic material in water over a 3-day incubation period at 27°C.',
    environmentalImpact: 'Elevated BOD (> 3.0 mg/L) indicates excessive organic waste input (flowers, puja materials, food offerings, unburnt organic matter). High BOD accelerates oxygen depletion.',
  },
  pH: {
    parameter: 'pH',
    fullName: 'Hydrogen Ion Concentration (pH)',
    unit: 'pH units',
    cpcbClassBStandard: '6.5 to 8.5',
    cpcbClassBThreshold: [6.5, 8.5],
    comparisonOperator: 'between',
    scientificMeaning: 'Logarithmic measure of the acidity or alkalinity of the water body, regulating chemical equilibria and heavy metal bioavailability.',
    environmentalImpact: 'Immersion of synthetic chemical paints, varnish, or industrial chemical colors can trigger shifts in pH, altering aquatic toxicity and carbonate buffering systems.',
  },
  Turbidity: {
    parameter: 'Turbidity',
    fullName: 'Turbidity',
    unit: 'NTU',
    cpcbClassBStandard: 'Screening Baseline (< 10 NTU typical lake baseline)',
    cpcbClassBThreshold: 10,
    comparisonOperator: 'lte',
    scientificMeaning: 'Measure of relative water clarity and suspended particulate matter causing light scattering.',
    environmentalImpact: 'Suspended Plaster of Paris (gypsum) and clay silt inhibit light penetration for benthic photosynthesis, clogging fish gills and coating the lakebed.',
  },
  TDS: {
    parameter: 'TDS',
    fullName: 'Total Dissolved Solids',
    unit: 'mg/L',
    cpcbClassBStandard: 'Screening Baseline (< 500 mg/L desirable)',
    cpcbClassBThreshold: 500,
    comparisonOperator: 'lte',
    scientificMeaning: 'Combined content of all inorganic and organic substances contained in water in molecular, ionized, or micro-granular suspended form.',
    environmentalImpact: 'Sharp spikes during immersion indicate leaching of soluble salts, decorative gypsum plaster, and inorganic mineral dyes.',
  },
};

export interface CPCBClassificationRow {
  classCategory: string;
  designatedBestUse: string;
  primaryCriteria: {
    param: string;
    value: string;
  }[];
  regulatoryContext: string;
}

export const CPCB_DESIGNATED_BEST_USE_CLASSES: CPCBClassificationRow[] = [
  {
    classCategory: 'Class A',
    designatedBestUse: 'Drinking Water Source without conventional treatment but after disinfection',
    primaryCriteria: [
      { param: 'Total Coliforms', value: '≤ 50 MPN/100ml' },
      { param: 'pH', value: '6.5 to 8.5' },
      { param: 'Dissolved Oxygen (DO)', value: '≥ 6.0 mg/L' },
      { param: 'BOD (3-day at 27°C)', value: '≤ 2.0 mg/L' },
    ],
    regulatoryContext: 'Pristine natural springs and protected reservoirs with minimal anthropogenic catchment activity.',
  },
  {
    classCategory: 'Class B (Primary Visarjan Screening Standard)',
    designatedBestUse: 'Outdoor Bathing / Organized Water Sports & Immersion',
    primaryCriteria: [
      { param: 'Total Coliforms', value: '≤ 500 MPN/100ml (Desirable), ≤ 2500 (Max)' },
      { param: 'pH', value: '6.5 to 8.5' },
      { param: 'Dissolved Oxygen (DO)', value: '≥ 5.0 mg/L' },
      { param: 'BOD (3-day at 27°C)', value: '≤ 3.0 mg/L' },
    ],
    regulatoryContext: 'Primary benchmark used by CPCB and MPPCB for monitoring designated visarjan ghats and public contact water bodies.',
  },
  {
    classCategory: 'Class C',
    designatedBestUse: 'Drinking Water Source after conventional treatment and disinfection',
    primaryCriteria: [
      { param: 'Total Coliforms', value: '≤ 5000 MPN/100ml' },
      { param: 'pH', value: '6.0 to 9.0' },
      { param: 'Dissolved Oxygen (DO)', value: '≥ 4.0 mg/L' },
      { param: 'BOD (3-day at 27°C)', value: '≤ 3.0 mg/L' },
    ],
    regulatoryContext: 'Municipal water intake zones, applicable to Bhojtal (Upper Lake) which supplies drinking water to ~40% of Bhopal.',
  },
  {
    classCategory: 'Class D',
    designatedBestUse: 'Propagation of Wild life & Fisheries',
    primaryCriteria: [
      { param: 'pH', value: '6.5 to 8.5' },
      { param: 'Dissolved Oxygen (DO)', value: '≥ 4.0 mg/L' },
      { param: 'Free Ammonia', value: '≤ 1.2 mg/L' },
    ],
    regulatoryContext: 'Ecologically sensitive wetland zones, migratory bird sanctuaries, and natural breeding habitats in Bhoj Wetland.',
  },
  {
    classCategory: 'Class E',
    designatedBestUse: 'Irrigation, Industrial Cooling, Controlled Waste disposal',
    primaryCriteria: [
      { param: 'pH', value: '6.0 to 8.5' },
      { param: 'Electrical Conductivity', value: '≤ 2250 micro mhos/cm' },
      { param: 'Sodium Adsorption Ratio', value: '≤ 26' },
      { param: 'Boron', value: '≤ 2.0 mg/L' },
    ],
    regulatoryContext: 'Agricultural irrigation channels and non-contact industrial thermal/cooling applications.',
  },
];
