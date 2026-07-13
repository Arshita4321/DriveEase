import { motion } from 'framer-motion';
import { FiFeather } from 'react-icons/fi';

const fuelScores = {
  electric: { score: 95, label: 'Zero Emission', color: 'text-emerald-500', bg: 'bg-emerald-500', bar: 'from-emerald-400 to-green-500', emoji: '🌿' },
  hybrid:   { score: 78, label: 'Low Emission', color: 'text-teal-500', bg: 'bg-teal-500', bar: 'from-teal-400 to-cyan-500', emoji: '🍃' },
  diesel:   { score: 55, label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500', bar: 'from-amber-400 to-yellow-500', emoji: '💨' },
  petrol:   { score: 40, label: 'Standard', color: 'text-orange-500', bg: 'bg-orange-500', bar: 'from-orange-400 to-red-400', emoji: '⛽' },
};

export default function EcoScore({ fuelType, efficiency, size = 'md' }) {
  const data = fuelScores[fuelType] || fuelScores.petrol;

  // Adjust score based on efficiency (higher efficiency = better score)
  const efficiencyBonus = fuelType === 'electric'
    ? Math.min(5, Math.round((efficiency - 15) * 0.5))
    : Math.min(15, Math.round((efficiency - 10) * 1.5));
  const finalScore = Math.min(100, data.score + efficiencyBonus);

  const co2PerKm = fuelType === 'electric'
    ? 0
    : fuelType === 'hybrid'
      ? Math.round(120 - efficiency * 3)
      : fuelType === 'diesel'
        ? Math.round(140 - efficiency * 2)
        : Math.round(170 - efficiency * 3);

  const sizes = {
    sm: { container: 'flex items-center gap-1.5', bar: 'h-1 w-12', text: 'text-[10px]', icon: 12 },
    md: { container: 'flex items-center gap-2', bar: 'h-1.5 w-20', text: 'text-xs', icon: 14 },
    lg: { container: 'flex items-center gap-3', bar: 'h-2 w-full', text: 'text-sm', icon: 18 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={s.container}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <FiFeather size={s.icon} className={data.color} />
      </motion.div>

      <div className="flex-1">
        {size === 'lg' && (
          <div className="mb-1 flex items-center justify-between">
            <span className={`font-semibold ${data.color}`}>
              {data.emoji} Eco Score: {finalScore}/100
            </span>
            <span className={`text-xs ${data.color}`}>{data.label}</span>
          </div>
        )}

        {/* Score bar */}
        <div className={`${s.bar} overflow-hidden rounded-full bg-primary-100 dark:bg-white/10`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${finalScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${data.bar}`}
          />
        </div>

        {size === 'lg' && co2PerKm > 0 && (
          <p className="mt-1 text-xs text-primary-400 dark:text-slate-500">
            ≈ {co2PerKm}g CO₂/km · {Math.round(co2PerKm * 100)}g for 100km trip
          </p>
        )}
      </div>
    </div>
  );
}
