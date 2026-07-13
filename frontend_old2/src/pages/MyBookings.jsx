import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiXCircle, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const statusTone = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'neutral' };
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%234338CA" opacity="0.15"/></svg>`);

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${toCancel._id}/cancel`);
      setBookings((b) => b.map((x) => (x._id === toCancel._id ? { ...x, status: 'cancelled' } : x)));
      toast.success('Booking cancelled');
      setToCancel(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="container-px mx-auto max-w-5xl py-10">
      <h1 className="font-display text-3xl font-bold text-primary-950 dark:text-white">My bookings</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Track, manage, and review your rentals.</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-grad-primary text-white shadow-glow'
                : 'bg-primary-50 text-primary-500 hover:bg-primary-100 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={FiPackage}
            title="No bookings here"
            description="Once you book a vehicle, it'll show up in this list."
            action={<Button as={Link} to="/vehicles">Browse vehicles</Button>}
          />
        )}

        {filtered.map((b, i) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
          >
            <img
              src={b.vehicle?.images?.[0] || PLACEHOLDER}
              alt={b.vehicle?.name}
              className="h-24 w-full rounded-xl object-cover sm:w-32"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/vehicles/${b.vehicle?._id}`} className="font-display font-semibold text-primary-950 hover:text-primary-600 dark:text-white">
                  {b.vehicle?.name || 'Vehicle'}
                </Link>
                <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                <Badge tone={b.paymentStatus === 'paid' ? 'success' : 'neutral'}>{b.paymentStatus}</Badge>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><FiCalendar size={12} /> {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-1"><FiMapPin size={12} /> {b.totalDays} day{b.totalDays > 1 ? 's' : ''}</span>
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-primary-900 dark:text-white">₹{b.totalPrice}</p>
            </div>
            {['pending', 'confirmed'].includes(b.status) && (
              <Button variant="secondary" size="sm" icon={FiXCircle} onClick={() => setToCancel(b)}>
                Cancel
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={!!toCancel} onClose={() => setToCancel(null)} title="Cancel this booking?">
        <p className="text-sm text-primary-600 dark:text-slate-300">
          This will cancel your booking for <strong>{toCancel?.vehicle?.name}</strong>. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToCancel(null)}>Keep booking</Button>
          <Button variant="danger" loading={cancelling} onClick={confirmCancel}>Yes, cancel it</Button>
        </div>
      </Modal>
    </div>
  );
}
