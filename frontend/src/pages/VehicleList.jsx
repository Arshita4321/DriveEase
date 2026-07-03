import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiSearch, FiSlash } from 'react-icons/fi';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';
import VehicleCard from '../components/VehicleCard';
import { VehicleCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
];

export default function VehicleList() {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);

  const type = params.get('type') || '';
  const location = params.get('location') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  useEffect(() => {
    setParam('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/vehicles', {
        params: { search: params.get('search'), type, location, minPrice, maxPrice, sort, page, limit: 9 },
      })
      .then(({ data }) => {
        setVehicles(data.vehicles || []);
        setPages(data.pages || 1);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [params]);

  const clearFilters = () => {
    setSearch('');
    setParams({});
  };

  const activeFilterCount = [type, location, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary-950 dark:text-white">Browse vehicles</h1>
        <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">
          {loading ? 'Searching…' : `${vehicles.length ? `Page ${page} of ${pages}` : 'No vehicles found'}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Button variant="secondary" size="sm" icon={FiFilter} onClick={() => setShowFilters((s) => !s)}>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
          <AnimatePresence>
            {(showFilters || true) && (
              <motion.div
                initial={false}
                className={`card-surface space-y-5 rounded-2xl p-5 ${showFilters ? 'block' : 'hidden'} lg:block`}
              >
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or brand"
                    className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-slate-500">Type</p>
                  <div className="flex gap-2">
                    {['', 'car', 'bike'].map((t) => (
                      <button
                        key={t || 'all'}
                        onClick={() => setParam('type', t)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                          type === t
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                            : 'border-primary-100 text-primary-500 hover:bg-primary-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5'
                        }`}
                      >
                        {t || 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-slate-500">Location</p>
                  <input
                    defaultValue={location}
                    onBlur={(e) => setParam('location', e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-slate-500">
                    Price per day (₹)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={minPrice}
                      onBlur={(e) => setParam('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-full rounded-xl border border-primary-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <span className="text-primary-300">—</span>
                    <input
                      type="number"
                      defaultValue={maxPrice}
                      onBlur={(e) => setParam('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-full rounded-xl border border-primary-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <Select label="Sort by" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" icon={FiX} onClick={clearFilters} className="w-full justify-center">
                    Clear filters
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Grid */}
        <div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <VehicleCardSkeleton key={i} />)
              : vehicles.map((v, i) => <VehicleCard key={v._id} vehicle={v} index={i} />)}
          </div>

          {!loading && vehicles.length === 0 && (
            <EmptyState
              icon={FiSlash}
              title="No vehicles match your filters"
              description="Try widening your search or clearing a few filters."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          )}

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setParam('page', String(i + 1))}
                  className={`h-9 w-9 rounded-xl text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-grad-primary text-white shadow-glow'
                      : 'text-primary-500 hover:bg-primary-50 dark:text-slate-400 dark:hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
