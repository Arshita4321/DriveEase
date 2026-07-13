import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiTruck, FiHome, FiCalendar, FiUser, FiBarChart2 } from 'react-icons/fi';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const staticActions = (isAdmin) => [
  { label: 'Go to home', to: '/', icon: FiHome },
  { label: 'Browse all vehicles', to: '/vehicles', icon: FiTruck },
  { label: 'My bookings', to: '/my-bookings', icon: FiCalendar },
  { label: 'My profile', to: '/profile', icon: FiUser },
  ...(isAdmin ? [{ label: 'Admin dashboard', to: '/admin', icon: FiBarChart2 }] : []),
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const debounced = useDebounce(query, 300);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }
    setLoading(true);
    api
      .get('/vehicles', { params: { search: debounced, limit: 6 } })
      .then(({ data }) => setResults(data.vehicles || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  const actions = staticActions(user?.role === 'admin').filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );
  const flatItems = [
    ...actions.map((a) => ({ type: 'action', ...a })),
    ...results.map((v) => ({ type: 'vehicle', ...v })),
  ];

  useEffect(() => setActiveIdx(0), [query, results.length]);

  const go = (item) => {
    if (!item) return;
    if (item.type === 'action') navigate(item.to);
    else navigate(`/vehicles/${item._id}`);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flatItems[activeIdx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="glass-strong relative z-10 w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-primary-100 px-4 py-3.5 dark:border-white/10">
              <FiSearch className="text-primary-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vehicles, pages, actions…"
                className="flex-1 bg-transparent text-sm text-primary-950 outline-none placeholder:text-primary-300 dark:text-white dark:placeholder:text-slate-500"
              />
              <kbd className="rounded-md border border-primary-100 px-1.5 py-0.5 font-mono text-[10px] text-primary-400 dark:border-white/10">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {actions.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-300 dark:text-slate-500">
                    Navigate
                  </p>
                  {actions.map((a, i) => (
                    <Row
                      key={a.label}
                      active={flatItems[activeIdx] === flatItems.find((x) => x.type === 'action' && x.label === a.label)}
                      icon={a.icon}
                      label={a.label}
                      onClick={() => go({ type: 'action', ...a })}
                    />
                  ))}
                </div>
              )}

              {loading && <p className="px-3 py-3 text-xs text-primary-400">Searching…</p>}

              {results.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-300 dark:text-slate-500">
                    Vehicles
                  </p>
                  {results.map((v) => (
                    <Row
                      key={v._id}
                      active={flatItems[activeIdx]?._id === v._id}
                      icon={FiTruck}
                      label={`${v.name} — ₹${v.pricePerDay}/day`}
                      sub={`${v.brand} · ${v.location}`}
                      onClick={() => go({ type: 'vehicle', ...v })}
                    />
                  ))}
                </div>
              )}

              {query && !loading && results.length === 0 && actions.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-primary-400">No matches for "{query}"</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ icon: Icon, label, sub, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
        active ? 'bg-primary-50 dark:bg-white/10' : 'hover:bg-primary-50 dark:hover:bg-white/5'
      }`}
    >
      <Icon size={15} className="shrink-0 text-primary-400" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-primary-900 dark:text-white">{label}</span>
        {sub && <span className="block truncate text-xs text-primary-400 dark:text-slate-500">{sub}</span>}
      </span>
      <FiArrowRight size={13} className="text-primary-300" />
    </button>
  );
}
