import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiLogIn, FiLogOut, FiSearch, FiUser } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

const STATUS_TONE = {
  pending: 'orange',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

export default function EmployeeBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api
      .get('/employee/bookings', { params })
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleCheckout = async (booking) => {
    try {
      await api.put(`/employee/bookings/${booking._id}/checkout`);
      toast.success(`Checked out — ${booking.vehicle?.name} handed to ${booking.user?.name}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleCheckin = async (booking) => {
    try {
      await api.put(`/employee/bookings/${booking._id}/checkin`);
      toast.success(`Checked in — ${booking.vehicle?.name} returned successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(s) ||
      b.vehicle?.name?.toLowerCase().includes(s) ||
      b.vehicle?.brand?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
          Booking Operations
        </h1>
        <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">
          Check-out vehicles to customers and check-in on return.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or vehicle…"
            className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {/* Bookings table */}
      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiCalendar} title="No bookings found" description="Try adjusting your filters." />
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const img = b.vehicle?.images?.[0] || PLACEHOLDER;
                const canCheckout = b.status === 'pending' || b.status === 'confirmed';
                const canCheckin = b.status === 'confirmed';
                return (
                  <tr key={b._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={img} alt={b.vehicle?.name} className="h-10 w-14 rounded-lg object-cover bg-primary-100" />
                        <div>
                          <p className="font-medium text-primary-900 dark:text-white">{b.vehicle?.name}</p>
                          <p className="text-xs text-primary-400">{b.vehicle?.brand} · <span className="capitalize">{b.vehicle?.type}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FiUser size={12} className="text-primary-400" />
                        <div>
                          <p className="text-primary-900 dark:text-white">{b.user?.name}</p>
                          <p className="text-xs text-primary-400">{b.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-primary-600 dark:text-slate-300">
                      <p className="text-xs">{format(new Date(b.startDate), 'MMM d')} — {format(new Date(b.endDate), 'MMM d, yyyy')}</p>
                      <p className="text-[11px] text-primary-400">{b.totalDays} day{b.totalDays > 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-primary-900 dark:text-white">₹{b.totalPrice}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={b.paymentStatus === 'paid' ? 'success' : 'neutral'}>{b.paymentStatus}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {canCheckout && (
                          <button
                            onClick={() => handleCheckout(b)}
                            className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
                            title="Check out — hand vehicle to customer"
                          >
                            <FiLogOut size={12} /> Check-out
                          </button>
                        )}
                        {canCheckin && (
                          <button
                            onClick={() => handleCheckin(b)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            title="Check in — vehicle returned"
                          >
                            <FiLogIn size={12} /> Check-in
                          </button>
                        )}
                        {!canCheckout && !canCheckin && (
                          <span className="text-xs text-primary-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
