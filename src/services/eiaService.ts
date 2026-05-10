/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EiaDataPoint, FUEL_SOURCE_MAP } from '../types';

const API_KEY = import.meta.env.VITE_EIA_API_KEY;
const BASE_URL = 'https://api.eia.gov/v2/electricity/rto';

// High-fidelity mock data generators
const generateMockGenerationData = (hours: number = 24) => {
  const data: any[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const period = time.toISOString().slice(0, 13).replace(/-/g, '') + 'T' + time.toISOString().slice(11, 13);
    
    data.push({ period, fueltype: 'COL', value: 50000 + Math.random() * 5000 });
    data.push({ period, fueltype: 'NG', value: 120000 + Math.random() * 10000 });
    data.push({ period, fueltype: 'NUC', value: 80000 + Math.random() * 1000 });
    data.push({ period, fueltype: 'HYC', value: 25000 + Math.random() * 2000 });
    data.push({ period, fueltype: 'SUN', value: Math.max(0, 40000 * Math.sin((time.getHours() - 6) * Math.PI / 12)) });
    data.push({ period, fueltype: 'WND', value: 30000 + Math.random() * 8000 });
  }
  return data;
};

const generateMockRegionData = (hours: number = 48) => {
  const data: any[] = [];
  const now = new Date();
  
  for (let i = hours; i >= -12; i--) { // Include 12 hours forecast
    const time = new Date(now.getTime() - i * 3600000);
    const period = time.toISOString().slice(0, 13).replace(/-/g, '') + 'T' + time.toISOString().slice(11, 13);
    
    const baseDemand = 400000 + 100000 * Math.sin((time.getHours() - 12) * Math.PI / 12);
    if (i >= 0) {
      data.push({ period, type: 'D', value: baseDemand + Math.random() * 10000 });
      data.push({ period, type: 'NG', value: baseDemand - 5000 + Math.random() * 10000 });
    }
    data.push({ period, type: 'DF', value: baseDemand + 2000 });
  }
  return data;
};

export async function fetchGridData() {
  if (!API_KEY) {
    console.warn('VITE_EIA_API_KEY not found. Using mock data.');
    return {
      generationByFuel: generateMockGenerationData(),
      regionData: generateMockRegionData(),
      isDemo: true
    };
  }

  try {
    const [fuelRes, regionRes] = await Promise.all([
      fetch(`${BASE_URL}/fuel-source-data/data/?api_key=${API_KEY}&frequency=hourly&data[0]=value&facets[respondent][]=US48&sort[0][column]=period&sort[0][direction]=desc&length=200`),
      fetch(`${BASE_URL}/region-data/data/?api_key=${API_KEY}&frequency=hourly&data[0]=value&facets[respondent][]=US48&sort[0][column]=period&sort[0][direction]=desc&length=100`)
    ]);

    if (!fuelRes.ok || !regionRes.ok) throw new Error('Failed to fetch data from EIA');

    const fuelData = await fuelRes.json();
    const regionData = await regionRes.json();

    return {
      generationByFuel: fuelData.response.data,
      regionData: regionData.response.data,
      isDemo: false
    };
  } catch (err) {
    console.error('Error fetching EIA data:', err);
    return {
      generationByFuel: generateMockGenerationData(),
      regionData: generateMockRegionData(),
      isDemo: true,
      error: 'Failed to connect to EIA API. showing demonstration data.'
    };
  }
}
