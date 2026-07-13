import { motion } from 'framer-motion';
import { FiMinus, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

// Simulated price prediction based on vehicle attributes
function predictPriceTrend(pricePerDay, location, fuelType) {
  // Simulate trend based on demand patterns
  const seed = (pricePerDay * 7 + location.length * 13) % 100;
  if (seed < 30) return { trend: 'falling', change: -(Math.round(seed / 5) + 3), confidence: 72 };
  if (seed < 60) return { trend: 'rising', change: Math.round(seed / 4) + 2, confidence: 68 };
  return { trend: 'stable', change: 0, confidence: 80 };
}

export default function PricePrediction({ pricePerDay, location, fuelType }) {
  const prediction = predictPriceTrend(pricePerDay, location, fuelType);

  const config = {
    rising: {
      icon: FiTrendingUp,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
      label: 'Prices rising',
      detail: `Expected +${prediction.change}% this week`,
    },
    falling: {
      icon: FiTrendingDown,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      label: 'Prices dropping',
      detail: `Expected -${Math.abs(prediction.change)}% this week`,
    },
    stable: {
      icon: FiMinus,
      color: 'text-primary-500',
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      border: 'border-primary-200 dark:border-primary-500/20',
      label: 'Price stable',
      detail: 'Good time to book',
    },
  };

  const c = config[prediction.trend];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2.5 rounded-xl border ${c.bg} ${c.border} px-3 py-2`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
        <Icon size={16} className={c.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold ${c.color}`}>{c.label}</p>
        <p className="text-[10px] text-primary-400 dark:text-slate-500">{c.detail}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] font-medium text-primary-400 dark:text-slate-500">Confidence</p>
        <p className={`text-xs font-bold ${c.color}`}>{prediction.confidence}%</p>
      </div>
    </motion.div>
  );
}
