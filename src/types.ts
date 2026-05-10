export interface EiaDataPoint {
  period: string;
  value: number;
  type?: string;
  fueltype?: string;
  respondent?: string;
}

export interface GridSummary {
  demand: number;
  generation: number;
  forecast: number;
  netImports: number;
  timestamp: string;
}

export interface FuelGeneration {
  coal: number;
  naturalGas: number;
  nuclear: number;
  hydro: number;
  solar: number;
  wind: number;
  other: number;
  timestamp: string;
}

export const FUEL_SOURCE_MAP: Record<string, string> = {
  COL: 'Coal',
  NG: 'Natural Gas',
  NUC: 'Nuclear',
  HYC: 'Hydro',
  SUN: 'Solar',
  WND: 'Wind',
  OTH: 'Other',
  OIL: 'Petroleum',
  WAT: 'Hydro',
};

export const FUEL_COLORS: Record<string, string> = {
  'Coal': '#4B5563',
  'Natural Gas': '#3B82F6',
  'Nuclear': '#EF4444',
  'Hydro': '#10B981',
  'Solar': '#F59E0B',
  'Wind': '#6366F1',
  'Other': '#9CA3AF',
  'Petroleum': '#1F2937',
};
