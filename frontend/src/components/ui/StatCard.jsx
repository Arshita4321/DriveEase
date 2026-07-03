import React from 'react';
import { motion } from 'framer-motion';
import useCountUp from '../../hooks/useCountUp';
import Card from './Card';

export default function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', tone = 'primary', delta }) {
  const animated = useCountUp(value);
  const display =
    Number.isInteger(value) ? Math.round(animated).toLocaleString() : animated.toFixed(1);

  const tones = {
    primary: 'from-primary-500 to-primary-700',
    cyan: 'from-cyan-400 to-cyan-600',
    orange: 'from-orange-400 to-orange-600',
    emerald: 'from-emerald-400 to-emerald-600',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${tones[tone]} opacity-10 blur-xl`}
      />
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-md`}
        >
          {Icon && <Icon size={20} />}
        </div>
        {delta !== undefined && (
          <span
            className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-mono text-2xl font-bold text-primary-950 dark:text-white">
        {prefix}
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}
