import { motion } from 'framer-motion';

const defaultItems = [
  { label: 'BMW', icon: '🚗' },
  { label: 'Honda', icon: '🏍️' },
  { label: 'Hyundai', icon: '🚙' },
  { label: 'Royal Enfield', icon: '🏍️' },
  { label: 'Toyota', icon: '🚗' },
  { label: 'KTM', icon: '🏍️' },
  { label: 'Maruti', icon: '🚗' },
  { label: 'Yamaha', icon: '🏍️' },
  { label: 'Kia', icon: '🚙' },
  { label: 'Bajaj', icon: '🏍️' },
];

export default function MarqueeBanner({ items = defaultItems, speed = 30, reverse = false }) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-6">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white dark:from-surface-dark to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white dark:from-surface-dark to-transparent" />

      <motion.div
        className="flex gap-8"
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          x: { duration: speed, repeat: Infinity, ease: 'linear' },
        }}
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-primary-100/60 bg-white/60 px-5 py-3 dark:border-white/10 dark:bg-white/5"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="whitespace-nowrap text-sm font-semibold text-primary-700 dark:text-slate-300">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
