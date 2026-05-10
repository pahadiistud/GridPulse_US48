/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { FUEL_COLORS } from '../types';
import { formatMW } from '../lib/utils';

interface GenerationChartProps {
  data: any[];
}

export function GenerationChart({ data }: GenerationChartProps) {
  return (
    <div className="w-full h-[400px] bg-zinc-950 border border-zinc-800 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 italic">
          NET GENERATION BY FUEL SOURCE (HR)
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] text-zinc-400">REAL-TIME DATA FEED</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            {Object.keys(FUEL_COLORS).map(fuel => (
              <linearGradient key={fuel} id={`color${fuel.replace(' ', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FUEL_COLORS[fuel]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={FUEL_COLORS[fuel]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="timeLabel" 
            stroke="#52525b" 
            fontSize={10} 
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              border: '1px solid #27272a',
              borderRadius: '0',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px'
            }}
            itemStyle={{ padding: '2px 0' }}
            formatter={(value: number) => [formatMW(value), '']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="rect"
            wrapperStyle={{ 
              fontFamily: 'JetBrains Mono', 
              fontSize: '10px',
              paddingTop: '20px',
              textTransform: 'uppercase'
            }}
          />
          {Object.keys(FUEL_COLORS).map(fuel => (
            <Area
              key={fuel}
              type="monotone"
              dataKey={fuel}
              stackId="1"
              stroke={FUEL_COLORS[fuel]}
              fillOpacity={1}
              fill={`url(#color${fuel.replace(' ', '')})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
