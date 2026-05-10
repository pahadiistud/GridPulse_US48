/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceArea
} from 'recharts';
import { formatMW } from '../lib/utils';

interface DemandChartProps {
  data: any[];
}

export function DemandChart({ data }: DemandChartProps) {
  return (
    <div className="w-full h-[400px] bg-zinc-950 border border-zinc-800 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 italic">
          DEMAND VS. GENERATION VS. FORECAST
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            formatter={(value: number) => [formatMW(value), '']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ 
              fontFamily: 'JetBrains Mono', 
              fontSize: '10px',
              paddingTop: '20px',
              textTransform: 'uppercase'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="demand" 
            stroke="#f43f5e" 
            strokeWidth={3} 
            dot={false}
            name="ACTUAL DEMAND"
          />
          <Line 
            type="monotone" 
            dataKey="generation" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={false}
            name="NET GENERATION"
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#a1a1aa" 
            strokeWidth={1} 
            strokeDasharray="5 5" 
            dot={false}
            name="DEMAND FORECAST"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
