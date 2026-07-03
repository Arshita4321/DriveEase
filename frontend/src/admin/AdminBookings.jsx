import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const statusTone = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'neutral' };
const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/bookings', { params: filter ? { status: filter } : {} }).then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status });
      setBookings((bs) => bs.map((b) => (b._id === id ? data : b)));
      toast.success(`Booking marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update booking');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{bookings.length} bookings</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} containerClassName="w-44">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={FiCalendar} title="No bookings found" />
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900 dark:text-white">{b.user?.name}</p>
                    <p className="text-xs text-primary-400">{b.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-primary-600 dark:text-slate-300">{b.vehicle?.name}</td>
                  <td className="px-4 py-3 text-xs text-primary-500 dark:text-slate-400">
                    {format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 font-mono text-primary-900 dark:text-white">₹{b.totalPrice}</td>
                  <td className="px-4 py-3"><Badge tone={b.paymentStatus === 'paid' ? 'success' : 'neutral'}>{b.paymentStatus}</Badge></td>
                  <td className="px-4 py-3">
                    <Select
                      value={b.status}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                      className="rounded-lg border-primary-100 px-2.5 py-1.5 text-xs font-medium capitalize dark:border-white/10"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
