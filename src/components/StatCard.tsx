/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatMW } from '../lib/utils';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  color?: string;
}

export function StatCard({ label, value, unit = 'MW', trend, color = 'text-white' }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-r border-b border-zinc-800 p-6 flex flex-col gap-2 bg-zinc-950/50 hover:bg-zinc-900/50 transition-colors"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-3xl font-medium tracking-tight ${color}`}>
          {formatMW(value).split(' ')[0]}
        </span>
        <span className="font-mono text-xs text-zinc-500">
          {formatMW(value).split(' ')[1]}
        </span>
      </div>
      {trend !== undefined && (
        <div className={`text-[10px] font-mono ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% FROM LAST HOUR
        </div>
      )}
    </motion.div>
  );
}
