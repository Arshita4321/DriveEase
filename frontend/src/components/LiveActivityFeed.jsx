import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const names = ['Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Meera', 'Aditya', 'Nisha', 'Rohan', 'Divya', 'Amit', 'Pooja', 'Sanjay'];
const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur', 'Goa', 'Kolkata', 'Ahmedabad'];
const vehicles = ['Honda City', 'BMW 3 Series', 'Royal Enfield Classic', 'Hyundai Creta', 'Maruti Swift', 'KTM Duke 390', 'Toyota Innova', 'Mahindra Thar', 'Honda Activa', 'Bajaj Pulsar'];
const actions = ['just booked', 'picked up', 'is reviewing'];

function randomActivity() {
  const name = names[Math.floor(Math.random() * names.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const mins = Math.floor(Math.random() * 30) + 1;
  return { id: Date.now() + Math.random(), name, city, vehicle, action, mins };
}

export default function LiveActivityFeed({ interval = 8000 }) {
  const [activity, setActivity] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show first one after 5 seconds
    const firstTimer = setTimeout(() => setActivity(randomActivity()), 5000);

    // Then cycle every `interval` ms
    const cycleTimer = setInterval(() => setActivity(randomActivity()), interval);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(cycleTimer);
    };
  }, [interval, dismissed]);

  useEffect(() => {
    if (!activity) return;
    const hideTimer = setTimeout(() => setActivity(null), 6000);
    return () => clearTimeout(hideTimer);
  }, [activity]);

  if (dismissed || !activity) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
        exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-4 left-1/2 z-50 w-[90vw] max-w-sm"
      >
        <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grad-primary text-sm font-bold text-white">
            {activity.name[0]}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary-950 dark:text-white">
              {activity.name} {activity.action}
            </p>
            <p className="truncate text-xs text-primary-500 dark:text-slate-400">
              {activity.vehicle} in {activity.city} · {activity.mins}m ago
            </p>
          </div>

          {/* Live dot */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => { setDismissed(true); setActivity(null); }}
            className="shrink-0 rounded-full p-1 text-primary-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-white/10"
          >
            <FiX size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
