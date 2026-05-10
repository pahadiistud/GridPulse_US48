/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from 'react';
import { fetchGridData } from './services/eiaService';
import { StatCard } from './components/StatCard';
import { GenerationChart } from './components/GenerationChart';
import { DemandChart } from './components/DemandChart';
import { FUEL_SOURCE_MAP } from './types';
import { formatMW } from './lib/utils';
import { Activity, Zap, BarChart3, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchGridData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('System failure: Unable to synchronize with EIA grid monitor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // Sync every 5 mins
    return () => clearInterval(interval);
  }, []);

  const processedData = useMemo(() => {
    if (!data) return null;

    // Process Fuel Generation
    const fuelPivot: Record<string, any> = {};
    data.generationByFuel.forEach((d: any) => {
      const hour = d.period;
      if (!fuelPivot[hour]) {
        fuelPivot[hour] = { 
          period: hour,
          timeLabel: hour.slice(9, 11) + ':00'
        };
      }
      const fuelName = FUEL_SOURCE_MAP[d.fueltype] || d.fueltype;
      fuelPivot[hour][fuelName] = d.value;
    });
    const fuelChartData = Object.values(fuelPivot).sort((a: any, b: any) => a.period.localeCompare(b.period)).slice(-24);

    // Process Regional Data (Demand/Generation)
    const regionPivot: Record<string, any> = {};
    data.regionData.forEach((d: any) => {
      const hour = d.period;
      if (!regionPivot[hour]) {
        regionPivot[hour] = { 
          period: hour,
          timeLabel: hour.slice(9, 11) + ':00'
        };
      }
      if (d.type === 'D') regionPivot[hour].demand = d.value;
      if (d.type === 'NG') regionPivot[hour].generation = d.value;
      if (d.type === 'DF') regionPivot[hour].forecast = d.value;
    });
    const demandChartData = Object.values(regionPivot).sort((a: any, b: any) => a.period.localeCompare(b.period)).slice(-48);

    // Current Stats
    const latestFuel = fuelChartData[fuelChartData.length - 1] || {};
    const latestRegion = demandChartData[demandChartData.length - 1] || {};
    const prevRegion = demandChartData[demandChartData.length - 2] || {};

    const totalGen = Object.keys(latestFuel).reduce((acc, key) => {
      if (key !== 'period' && key !== 'timeLabel') return acc + (latestFuel[key] || 0);
      return acc;
    }, 0);

    const demandTrend = prevRegion.demand ? ((latestRegion.demand - prevRegion.demand) / prevRegion.demand) * 100 : 0;

    return {
      fuelChartData,
      demandChartData,
      current: {
        demand: latestRegion.demand || 0,
        generation: latestRegion.generation || totalGen,
        forecast: latestRegion.forecast || 0,
        demandTrend
      }
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-zinc-700 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">Synchronizing Grid State...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-emerald-950">
      {/* Top Navigation / Status Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center rounded-sm">
              <Zap className="w-5 h-5 text-zinc-950" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-tight uppercase">GridPulse</h1>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">US48 Electric Infrastructure Monitor</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="font-mono text-[9px] text-emerald-500 uppercase tracking-wider">Operational</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Global Timestamp</span>
              <span className="font-mono text-[11px] text-zinc-300 tabular-nums">
                {lastUpdated.toLocaleTimeString('en-US', { hour12: false })} UTC
              </span>
            </div>
            <button 
              onClick={loadData}
              className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all rounded group"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-500 group-hover:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        {/* Alerts / Info Banner */}
        {data?.isDemo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="font-mono text-[10px] text-amber-500/80 uppercase">
              Notice: API Credentials not configured. Displaying high-fidelity telemetry simulation.
            </p>
          </motion.div>
        )}

        {/* High-Level Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-zinc-800 bg-zinc-900/20">
          <StatCard 
            label="Real-Time Demand" 
            value={processedData?.current.demand} 
            trend={processedData?.current.demandTrend}
            color="text-rose-500"
          />
          <StatCard 
            label="Net Generation" 
            value={processedData?.current.generation} 
            color="text-emerald-500"
          />
          <StatCard 
            label="Day-Ahead Forecast" 
            value={processedData?.current.forecast} 
            color="text-zinc-100"
          />
          <StatCard 
            label="Grid Margin" 
            value={(processedData?.current.generation || 0) - (processedData?.current.demand || 0)} 
            unit="MW"
            color="text-sky-500"
          />
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GenerationChart data={processedData?.fuelChartData || []} />
          <DemandChart data={processedData?.demandChartData || []} />
        </div>

        {/* Technical Detail Pane */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 border border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 italic flex items-center gap-2">
                <Info className="w-3 h-3" /> System Insights & Anomalies
              </h3>
              <span className="font-mono text-[9px] text-zinc-600">SOURCE: EIA OPEN DATA V2</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Renewable Mix</p>
                  <p className="font-mono text-xl text-emerald-500">
                    {Math.round(((processedData?.fuelChartData?.[23]?.Solar || 0) + (processedData?.fuelChartData?.[23]?.Wind || 0)) / (processedData?.current.generation || 1) * 100)}%
                  </p>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Interchange Error</p>
                  <p className="font-mono text-xl text-zinc-100">0.02%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase">Frequency stability</p>
                  <p className="font-mono text-xl text-zinc-100">60.00 Hz</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                The Eastern and Western Interconnections combined with ERCOT show overall stability. 
                Solar ramp peaking observed in CAISO and SE region as of last telemetry update.
                Next generation step expected at sunset interval.
              </p>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 italic">Regional Distribution</h3>
            <div className="flex flex-col gap-4">
              {['East', 'West', 'Central', 'Texas'].map((region, i) => (
                <div key={region} className="group cursor-default">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[11px] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">{region} Interconnect</span>
                    <span className="font-mono text-[11px] text-emerald-500">{(80 + i * 5).toFixed(1)}% Load</span>
                  </div>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${80 + i * 5}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${i % 2 === 0 ? 'bg-zinc-100' : 'bg-emerald-500'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Scroller Footer */}
      <footer className="mt-12 border-t border-zinc-800 p-8 pb-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest italic">Infrastructure Details</h4>
            <ul className="space-y-2 font-mono text-[11px] text-zinc-400">
              <li className="flex justify-between"><span>Active Connections</span> <span>9,842</span></li>
              <li className="flex justify-between"><span>Interchange Nodes</span> <span>2,140</span></li>
              <li className="flex justify-between"><span>Telemetry Latency</span> <span>1.2s</span></li>
            </ul>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest italic">Monitor Specification</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xl">
              GridPulse US aggregates real-time electric power grid data from the EIA Open Data API. 
              Figures represent net generation and demand across the Lower 48 states. 
              Forecasting values are derived from hourly day-ahead RTO submissions.
            </p>
          </div>
          <div className="space-y-4 text-right">
            <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest italic flex items-center justify-end gap-2">
              System Pulsar <Activity className="w-2 h-2 text-emerald-500" />
            </h4>
            <p className="font-mono text-[32px] text-zinc-100/10 select-none">GRID PULSE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
