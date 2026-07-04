import { motion } from 'framer-motion';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import VehicleCard from './VehicleCard';

export default function RecentlyViewed({ vehicles }) {
  const scrollRef = useRef(null);

  if (!vehicles || vehicles.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-10">
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
              <FiClock size={16} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-primary-950 dark:text-white">Recently viewed</h2>
              <p className="text-xs text-primary-500 dark:text-slate-400">Pick up where you left off</p>
            </div>
          </div>
          {vehicles.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="rounded-full border border-primary-100 bg-white p-2 text-primary-500 shadow-sm transition-colors hover:bg-primary-50 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Scroll left"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="rounded-full border border-primary-100 bg-white p-2 text-primary-500 shadow-sm transition-colors hover:bg-primary-50 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Scroll right"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {vehicles.map((vehicle, i) => (
            <div
              key={vehicle._id}
              className="w-[280px] shrink-0 scroll-start"
              style={{ scrollSnapAlign: 'start' }}
            >
              <VehicleCard vehicle={vehicle} index={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
