import { motion } from 'framer-motion';
import { useState } from 'react';

const cities = [
  { name: 'Delhi', x: 52, y: 22, vehicles: 85, color: 'from-primary-500 to-purple-600' },
  { name: 'Mumbai', x: 35, y: 55, vehicles: 120, color: 'from-cyan-500 to-blue-600' },
  { name: 'Bengaluru', x: 45, y: 75, vehicles: 95, color: 'from-emerald-500 to-teal-600' },
  { name: 'Pune', x: 40, y: 60, vehicles: 45, color: 'from-amber-500 to-orange-600' },
  { name: 'Chennai', x: 55, y: 78, vehicles: 60, color: 'from-rose-500 to-pink-600' },
  { name: 'Hyderabad', x: 48, y: 65, vehicles: 55, color: 'from-violet-500 to-indigo-600' },
  { name: 'Kolkata', x: 70, y: 48, vehicles: 40, color: 'from-lime-500 to-green-600' },
  { name: 'Jaipur', x: 40, y: 35, vehicles: 30, color: 'from-fuchsia-500 to-purple-600' },
];

export default function AnimatedCityMap() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-lg">
      {/* Stylized India outline */}
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
        <motion.path
          d="M30 10 L50 5 L70 12 L78 25 L75 40 L80 55 L65 80 L55 95 L45 90 L35 78 L25 60 L20 40 L25 25 Z"
          className="stroke-primary-200 dark:stroke-white/10"
          strokeWidth="0.5"
          fill="currentColor"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.15 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </svg>

      {/* City pins */}
      {cities.map((city, i) => (
        <motion.div
          key={city.name}
          className="absolute cursor-pointer"
          style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          onMouseEnter={() => setHovered(city.name)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Pulse ring */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${city.color} opacity-30`}
            animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            style={{ width: 20, height: 20, left: -4, top: -4 }}
          />
          {/* Pin dot */}
          <motion.div
            whileHover={{ scale: 1.4 }}
            className={`relative flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br ${city.color} shadow-lg`}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </motion.div>

          {/* Tooltip */}
          {hovered === city.name && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="card-surface absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl px-3 py-2 text-center shadow-lg"
            >
              <p className="text-xs font-bold text-primary-950 dark:text-white">{city.name}</p>
              <p className="text-[10px] text-primary-500 dark:text-slate-400">{city.vehicles} vehicles</p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
