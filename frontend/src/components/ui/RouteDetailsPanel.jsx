import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiClock, FiTarget, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from './Button';

export default function RouteDetailsPanel({ trip, onClose }) {
  if (!trip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex items-center justify-end bg-primary-950/20 backdrop-blur-sm sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl dark:bg-surface-darkcard sm:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-48 w-full shrink-0">
            <img src={trip.image} alt={trip.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/40"
            >
              <FiX size={20} />
            </button>
            <h3 className="absolute bottom-4 left-6 pr-6 font-display text-2xl font-bold text-white">
              {trip.name}
            </h3>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm leading-relaxed text-primary-600 dark:text-slate-400">
              {trip.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary-50 p-4 dark:bg-white/[0.03]">
                <FiMapPin className="text-primary-500" size={20} />
                <p className="mt-2 text-xs font-semibold text-primary-500 uppercase tracking-wider">Distance</p>
                <p className="font-display font-bold text-primary-950 dark:text-white">{trip.distance}</p>
              </div>
              <div className="rounded-2xl bg-primary-50 p-4 dark:bg-white/[0.03]">
                <FiClock className="text-accent-cyan" size={20} />
                <p className="mt-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider">Duration</p>
                <p className="font-display font-bold text-primary-950 dark:text-white">{trip.duration}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-primary-50 p-4 dark:bg-white/[0.03]">
              <FiTarget className="text-accent-orange" size={20} />
              <p className="mt-2 text-xs font-semibold text-accent-orange uppercase tracking-wider">Terrain</p>
              <p className="font-display font-bold text-primary-950 dark:text-white">{trip.terrain}</p>
            </div>

            <div className="mt-8">
              <h4 className="font-display font-bold text-primary-950 dark:text-white">Recommended Vehicles</h4>
              <div className="mt-3 flex gap-2">
                {trip.tags.map(tag => (
                  <span key={tag} className="rounded-lg bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-white/10 dark:text-primary-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="border-t border-primary-100 bg-white p-6 dark:border-white/10 dark:bg-surface-darkcard">
            <Button
              as={Link}
              to={`/vehicles?type=${trip.tags[0].toLowerCase()}`}
              variant="primary"
              className="w-full justify-center"
              iconRight={FiArrowRight}
            >
              Find Vehicles for this Trip
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
