import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiCompass, FiDroplet, FiGlobe, FiMapPin, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const tripTypes = [
  { id: 'hill', label: 'Hill Station', icon: FiGlobe, color: 'from-emerald-500 to-teal-600', terrain: 'mountain' },
  { id: 'beach', label: 'Beach / Coast', icon: FiDroplet, color: 'from-cyan-500 to-blue-600', terrain: 'coastal' },
  { id: 'city', label: 'City Tour', icon: FiMapPin, color: 'from-purple-500 to-indigo-600', terrain: 'urban' },
  { id: 'highway', label: 'Highway Road Trip', icon: FiCompass, color: 'from-amber-500 to-orange-600', terrain: 'highway' },
];

const groupSizes = [
  { id: 'solo', label: 'Solo', count: '1-2', icon: '🧑' },
  { id: 'couple', label: 'Couple', count: '2', icon: '👫' },
  { id: 'family', label: 'Family', count: '4-6', icon: '👨‍👩‍👧‍👦' },
  { id: 'group', label: 'Group', count: '6+', icon: '👥' },
];

const recommendations = {
  'hill-solo': { type: 'bike', name: 'Royal Enfield Himalayan', reason: 'Perfect single-cylinder torque for steep ghats' },
  'hill-couple': { type: 'car', name: 'Mahindra Thar', reason: '4x4 capability with compact size for narrow mountain roads' },
  'hill-family': { type: 'car', name: 'Mahindra Scorpio', reason: 'Spacious SUV with 4WD for safe family mountain travel' },
  'hill-group': { type: 'car', name: 'Toyota Innova Crysta', reason: 'Powerful diesel SUV with ample space for groups' },
  'beach-solo': { type: 'bike', name: 'Honda Activa', reason: 'Lightweight scooter perfect for coastal cruising' },
  'beach-couple': { type: 'car', name: 'Honda City', reason: 'Comfortable sedan with great AC for hot coastal days' },
  'beach-family': { type: 'car', name: 'Hyundai Creta', reason: 'Spacious SUV with easy-to-clean interiors for sandy trips' },
  'beach-group': { type: 'car', name: 'Toyota Innova', reason: 'Roomy cabin for the whole crew + luggage for beach gear' },
  'city-solo': { type: 'bike', name: 'Honda Activa / Jupiter', reason: 'Nimble scooter for zipping through city traffic' },
  'city-couple': { type: 'car', name: 'Maruti Swift', reason: 'Compact hatchback — easy parking, great mileage' },
  'city-family': { type: 'car', name: 'Hyundai Creta', reason: 'Comfortable compact SUV for family sightseeing' },
  'city-group': { type: 'car', name: 'Toyota Innova', reason: 'Spacious people-mover for group city tours' },
  'highway-solo': { type: 'bike', name: 'KTM Duke 390', reason: 'Highway-capable performance motorcycle' },
  'highway-couple': { type: 'car', name: 'Honda City', reason: 'Excellent highway mileage with comfortable ride' },
  'highway-family': { type: 'car', name: 'Maruti Ertiga', reason: 'Fuel-efficient MPV designed for long family drives' },
  'highway-group': { type: 'car', name: 'Toyota Innova Crysta', reason: 'Diesel torque + 7 seats = ultimate highway cruiser' },
};

export default function AITripRecommender() {
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState(null);
  const [group, setGroup] = useState(null);
  const [budget, setBudget] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const getRecommendation = () => {
    if (!trip || !group) return null;
    const key = `${trip.id}-${group.id}`;
    const rec = recommendations[key];
    if (!rec) return null;

    return {
      ...rec,
      budgetNote: budget === 'low'
        ? 'Look for deals under ₹1,500/day'
        : budget === 'high'
          ? 'Premium options available ₹3,000+/day'
          : 'Mid-range options ₹1,500–₹3,000/day',
    };
  };

  const reset = () => {
    setStep(0);
    setTrip(null);
    setGroup(null);
    setBudget(null);
    setShowResult(false);
  };

  const rec = getRecommendation();

  return (
    <div className="card-surface overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="bg-grad-primary px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <FiZap className="animate-pulse" size={18} />
          <h3 className="font-display font-bold">AI Trip Recommender</h3>
        </div>
        <p className="mt-1 text-xs text-white/80">Tell us about your trip — we'll find the perfect ride</p>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* Step 0: Trip type */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="mb-3 text-sm font-semibold text-primary-950 dark:text-white">Where are you heading?</p>
              <div className="grid grid-cols-2 gap-2">
                {tripTypes.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setTrip(t); setStep(1); }}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                      trip?.id === t.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-primary-100 hover:border-primary-200 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-white`}>
                      <t.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-950 dark:text-white">{t.label}</p>
                      <p className="text-[10px] capitalize text-primary-400 dark:text-slate-500">{t.terrain}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Group size */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="mb-3 text-sm font-semibold text-primary-950 dark:text-white">Who's travelling?</p>
              <div className="grid grid-cols-2 gap-2">
                {groupSizes.map((g) => (
                  <motion.button
                    key={g.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setGroup(g); setStep(2); }}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                      group?.id === g.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-primary-100 hover:border-primary-200 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-primary-950 dark:text-white">{g.label}</p>
                      <p className="text-[10px] text-primary-400 dark:text-slate-500">{g.count} people</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setStep(0)} className="mt-3 text-xs font-medium text-primary-500 hover:text-primary-700">← Back</button>
            </motion.div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="mb-3 text-sm font-semibold text-primary-950 dark:text-white">Your budget per day?</p>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'low', label: 'Economy', range: 'Under ₹1,500/day', emoji: '💰' },
                  { id: 'mid', label: 'Standard', range: '₹1,500 – ₹3,000/day', emoji: '💰💰' },
                  { id: 'high', label: 'Premium', range: '₹3,000+/day', emoji: '💰💰💰' },
                ].map((b) => (
                  <motion.button
                    key={b.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setBudget(b.id); setShowResult(true); }}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                      budget?.id === b.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-primary-100 hover:border-primary-200 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{b.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-primary-950 dark:text-white">{b.label}</p>
                      <p className="text-xs text-primary-400 dark:text-slate-500">{b.range}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-3 text-xs font-medium text-primary-500 hover:text-primary-700">← Back</button>
            </motion.div>
          )}

          {/* Result */}
          {showResult && rec && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="mb-3 rounded-xl bg-gradient-to-br from-primary-50 to-cyan-50 p-4 dark:from-primary-500/10 dark:to-cyan-500/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rec.type === 'bike' ? '🏍️' : '🚗'}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary-500">We recommend</p>
                    <p className="font-display text-lg font-bold text-primary-950 dark:text-white">{rec.name}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-primary-600 dark:text-slate-300">{rec.reason}</p>
                <p className="mt-1 text-xs font-medium text-primary-500 dark:text-primary-400">{rec.budgetNote}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  as={Link}
                  to={`/vehicles?type=${rec.type}`}
                  variant="primary"
                  size="sm"
                  className="flex-1 justify-center"
                >
                  Browse {rec.type}s
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Restart
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
