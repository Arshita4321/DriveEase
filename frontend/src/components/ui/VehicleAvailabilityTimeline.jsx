import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FiCalendar } from 'react-icons/fi';

// Generate a simulated availability schedule
function generateSchedule(vehicleId, days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const schedule = [];

  // Use vehicleId as seed for consistent results
  const seed = vehicleId ? vehicleId.charCodeAt(vehicleId.length - 1) : 42;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const daySeed = (seed + i * 7) % 10;
    const isBooked = daySeed < 3; // ~30% booked
    const isPartial = !isBooked && daySeed === 3; // ~10% partial

    schedule.push({
      date,
      day: date.getDate(),
      weekday: date.toLocaleDateString('en', { weekday: 'short' }),
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      status: isBooked ? 'booked' : isPartial ? 'partial' : 'available',
      bookedBy: isBooked ? 'Booked' : isPartial ? 'Half day' : null,
    });
  }
  return schedule;
}

export default function VehicleAvailabilityTimeline({ vehicleId, vehicle }) {
  const schedule = useMemo(() => generateSchedule(vehicleId), [vehicleId]);

  const statusColors = {
    available: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
    booked: 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/30',
    partial: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
  };

  const dotColors = {
    available: 'bg-emerald-500',
    booked: 'bg-red-500',
    partial: 'bg-amber-500',
  };

  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
            <FiCalendar size={16} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary-950 dark:text-white">Availability</h3>
            <p className="text-[10px] text-primary-400 dark:text-slate-500">Next 14 days</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Open</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Partial</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Booked</span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex gap-1">
        {schedule.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.03 }}
            className="group relative flex flex-1 flex-col items-center"
          >
            {/* Day label */}
            <span className={`mb-1 text-[9px] font-medium ${day.isToday ? 'font-bold text-primary-600 dark:text-primary-300' : 'text-primary-400 dark:text-slate-500'}`}>
              {day.isToday ? 'Today' : day.weekday}
            </span>

            {/* Bar */}
            <div
              className={`w-full rounded-md border ${statusColors[day.status]} transition-all group-hover:scale-y-110`}
              style={{ height: day.status === 'booked' ? 32 : day.status === 'partial' ? 24 : 40 }}
            >
              <div className={`mx-auto mt-1 h-1.5 w-1.5 rounded-full ${dotColors[day.status]}`} />
            </div>

            {/* Date number */}
            <span className={`mt-1 text-[10px] ${day.isToday ? 'font-bold text-primary-950 dark:text-white' : 'text-primary-400 dark:text-slate-500'}`}>
              {day.day}
            </span>

            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary-950 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-white dark:text-primary-950">
              {day.status === 'booked' ? 'Unavailable' : day.status === 'partial' ? 'Half day left' : 'Available'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
