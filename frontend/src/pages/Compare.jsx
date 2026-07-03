import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiSearch, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';
import Rating from '../components/ui/Rating';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const ROWS = [
  { key: 'pricePerDay', label: 'Price / day', render: (v) => `₹${v.pricePerDay}` },
  { key: 'type', label: 'Type', render: (v) => <span className="capitalize">{v.type}</span> },
  { key: 'brand', label: 'Brand', render: (v) => v.brand },
  { key: 'transmission', label: 'Transmission', render: (v) => <span className="capitalize">{v.transmission}</span> },
  { key: 'fuelType', label: 'Fuel type', render: (v) => <span className="capitalize">{v.fuelType}</span> },
  { key: 'seats', label: 'Seats', render: (v) => v.seats },
  { key: 'location', label: 'Location', render: (v) => v.location },
  { key: 'averageRating', label: 'Rating', render: (v) => <Rating value={v.averageRating} count={v.numReviews} /> },
  { key: 'isAvailable', label: 'Availability', render: (v) => (v.isAvailable ? <Badge tone="success">Available</Badge> : <Badge tone="danger">Booked</Badge>) },
];

export default function Compare() {
  const [slots, setSlots] = useState([null, null, null]);
  const [pickerIdx, setPickerIdx] = useState(null);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (pickerIdx === null) return;
    api
      .get('/vehicles', { params: { search: debounced, limit: 6 } })
      .then(({ data }) => setResults(data.vehicles || []));
  }, [debounced, pickerIdx]);

  const pick = (vehicle) => {
    setSlots((s) => s.map((x, i) => (i === pickerIdx ? vehicle : x)));
    setPickerIdx(null);
    setQuery('');
  };

  const filled = slots.filter(Boolean);

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-primary-950 dark:text-white">
        <FiBarChart2 className="text-primary-500" /> Compare vehicles
      </h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Add up to 3 vehicles to compare specs and pricing side by side.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {slots.map((v, i) => (
          <div key={i} className="card-surface relative overflow-hidden rounded-2xl">
            {v ? (
              <>
                <button
                  onClick={() => setSlots((s) => s.map((x, idx) => (idx === i ? null : x)))}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                  <FiX size={13} />
                </button>
                <img src={v.images?.[0]} alt={v.name} className="h-36 w-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                <div className="p-4">
                  <Link to={`/vehicles/${v._id}`} className="font-display font-semibold text-primary-950 hover:text-primary-600 dark:text-white">
                    {v.name}
                  </Link>
                  <p className="text-xs text-primary-400 dark:text-slate-500">{v.brand}</p>
                </div>
              </>
            ) : (
              <button
                onClick={() => setPickerIdx(i)}
                className="flex h-full min-h-[13rem] w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-primary-200 text-primary-400 hover:border-primary-400 hover:text-primary-600 dark:border-white/10"
              >
                <FiPlus size={22} />
                <span className="text-sm font-medium">Add vehicle</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {filled.length >= 2 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-surface mt-10 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[500px] text-sm">
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.key} className={ri % 2 === 0 ? 'bg-primary-50/50 dark:bg-white/[0.02]' : ''}>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-primary-500 dark:text-slate-400">{row.label}</td>
                  {filled.map((v) => (
                    <td key={v._id} className="px-5 py-3 text-primary-900 dark:text-slate-100">{row.render(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
                  <button key={v._id} onClick={() => pick(v)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-white/5">
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
