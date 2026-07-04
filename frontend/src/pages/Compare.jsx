import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiBarChart2, FiDroplet, FiMapPin, FiPlus, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Rating from '../components/ui/Rating';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

export default function Compare() {
  const [slots, setSlots] = useState([null, null, null]);
  const [pickerIdx, setPickerIdx] = useState(null);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (pickerIdx === null) return;
    api
      .get('/vehicles', { params: { search: debounced, limit: 8 } })
      .then(({ data }) => setResults(data.vehicles || []));
  }, [debounced, pickerIdx]);

  const pick = (vehicle) => {
    setSlots((s) => s.map((x, i) => (i === pickerIdx ? vehicle : x)));
    setPickerIdx(null);
    setQuery('');
  };

  const remove = (i) => setSlots((s) => s.map((x, idx) => (idx === i ? null : x)));

  const filled = slots.filter(Boolean);

  const bestValue = useMemo(() => {
    if (filled.length < 2) return null;
    return filled.reduce((best, v) => {
      const score = (v.averageRating || 0) * 10 - v.pricePerDay / 10 + (v.seats || 0);
      return score > best.score ? { vehicle: v, score } : best;
    }, { vehicle: filled[0], score: -Infinity }).vehicle;
  }, [filled]);

  const maxPrice = useMemo(() => Math.max(...filled.map((v) => v.pricePerDay), 1), [filled]);

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-primary-950 dark:text-white">
            <FiBarChart2 className="text-primary-500" /> Compare vehicles
          </h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Add up to 3 vehicles to compare specs, pricing, and value side by side.</p>
        </div>
        {bestValue && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <FiAward size={16} />
            <span className="text-xs font-semibold">Best value: {bestValue.name}</span>
          </motion.div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnimatePresence>
          {slots.map((v, i) => (
            <motion.div
              key={v ? v._id : `slot-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="card-surface relative overflow-hidden rounded-2xl"
            >
              {v ? (
                <>
                  <button
                    onClick={() => remove(i)}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  >
                    <FiX size={13} />
                  </button>
                  {v._id === bestValue?._id && (
                    <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
                      <FiAward size={10} /> Best value
                    </div>
                  )}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={v.images?.[0] || PLACEHOLDER}
                      alt={v.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <Badge tone="primary" className="glass !bg-white/80 dark:!bg-black/40">{v.type}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <Link to={`/vehicles/${v._id}`} className="font-display font-semibold text-primary-950 hover:text-primary-600 dark:text-white">
                      {v.name}
                    </Link>
                    <p className="text-xs text-primary-400 dark:text-slate-500">{v.brand} · {v.year || ''}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="neutral" className="text-[10px]">₹{Math.round(v.pricePerDay / (v.seats || 1))}/seat/day</Badge>
                      <Badge tone="neutral" className="text-[10px]">{v.seats} seats</Badge>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setPickerIdx(i)}
                  className="flex h-full min-h-[13rem] w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-primary-200 text-primary-400 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:hover:border-primary-300 dark:hover:text-primary-300"
                >
                  <FiPlus size={22} />
                  <span className="text-sm font-medium">Add vehicle</span>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filled.length >= 2 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-surface mt-10 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <tbody>
                {/* Price comparison bars */}
                <tr className="bg-primary-50/30 dark:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-primary-500 dark:text-slate-400">Price / day</td>
                  {filled.map((v) => (
                    <td key={v._id} className="px-5 py-3.5 align-bottom">
                      <div className="mb-1 font-display text-lg font-bold text-primary-950 dark:text-white">₹{v.pricePerDay}</div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(v.pricePerDay / maxPrice) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${v._id === bestValue?._id ? 'bg-emerald-500' : 'bg-primary-400'}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
                <MetricRow label="Value score" filled={filled} bestId={bestValue?._id}>
                  {(v) => {
                    const score = ((v.averageRating || 0) * 10 - v.pricePerDay / 10 + (v.seats || 0)).toFixed(1);
                    return <span className="font-semibold">{score}</span>;
                  }}
                </MetricRow>
                <MetricRow label="Cost per seat" filled={filled} bestId={bestValue?._id}>
                  {(v) => `₹${Math.round(v.pricePerDay / (v.seats || 1))}`}
                </MetricRow>
                <MetricRow label="Type" filled={filled}>{(v) => <span className="capitalize">{v.type}</span>}</MetricRow>
                <MetricRow label="Brand" filled={filled}>{(v) => v.brand}</MetricRow>
                <MetricRow label="Transmission" filled={filled}>{(v) => <span className="capitalize">{v.transmission}</span>}</MetricRow>
                <MetricRow label="Fuel type" filled={filled}>{(v) => <span className="flex items-center gap-1 capitalize"><FiDroplet size={11} /> {v.fuelType}</span>}</MetricRow>
                <MetricRow label="Seats" filled={filled}>{(v) => <span className="flex items-center gap-1"><FiUsers size={11} /> {v.seats}</span>}</MetricRow>
                <MetricRow label="Location" filled={filled}>{(v) => <span className="flex items-center gap-1"><FiMapPin size={11} /> {v.location}</span>}</MetricRow>
                <MetricRow label="Rating" filled={filled}>
                  {(v) => <Rating value={v.averageRating} count={v.numReviews} />}
                </MetricRow>
                <MetricRow label="Availability" filled={filled}>
                  {(v) => (v.isAvailable ? <Badge tone="success">Available</Badge> : <Badge tone="danger">Booked</Badge>)}
                </MetricRow>
                <tr>
                  <td className="px-5 py-3"></td>
                  {filled.map((v) => (
                    <td key={v._id} className="px-5 py-3">
                      <Button as={Link} to={`/vehicles/${v._id}`} variant={v._id === bestValue?._id ? 'primary' : 'secondary'} size="sm" className="w-full justify-center">
                        View details
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="mt-10">
          <EmptyState icon={FiBarChart2} title="Add at least 2 vehicles" description="Pick vehicles above to see a detailed side-by-side comparison." />
        </div>
      )}

      <AnimatePresence>
        {pickerIdx !== null && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm" onClick={() => setPickerIdx(null)} />
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 border-b border-primary-100 px-4 py-3.5 dark:border-white/10">
                <FiSearch className="text-primary-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a vehicle to compare…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-primary-300 dark:text-white"
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((v) => (
                  <button key={v._id} onClick={() => pick(v)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-white/5">
                    <img src={v.images?.[0] || PLACEHOLDER} alt="" className="h-9 w-12 rounded-lg object-cover" />
                    <span className="flex-1 truncate text-primary-900 dark:text-white">{v.name}</span>
                    <span className="font-mono text-xs text-primary-400">₹{v.pricePerDay}/day</span>
                  </button>
                ))}
                {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-primary-400">Type to search…</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricRow({ label, filled, bestId, children }) {
  return (
    <tr className="border-t border-primary-100 dark:border-white/[0.06]">
      <td className="whitespace-nowrap px-5 py-3 font-medium text-primary-500 dark:text-slate-400">{label}</td>
      {filled.map((v) => (
        <td
          key={v._id}
          className={`px-5 py-3 text-primary-900 transition-colors dark:text-slate-100 ${v._id === bestId ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : ''}`}
        >
          {children(v)}
        </td>
      ))}
    </tr>
  );
}

