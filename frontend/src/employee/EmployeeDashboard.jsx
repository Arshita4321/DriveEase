import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { FiArrowRight, FiCalendar, FiCheckCircle, FiClock, FiTruck, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employee/dashboard')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const { counts, todayPickups, todayReturns } = data;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Today's overview
          </p>
        </div>
        <Link
          to="/employee/bookings"
          className="flex items-center gap-2 rounded-xl bg-grad-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Manage bookings <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FiCalendar} label="Today's pickups" value={counts.todayPickups} tone="primary" />
        <StatCard icon={FiCheckCircle} label="Today's returns" value={counts.todayReturns} tone="cyan" />
        <StatCard icon={FiClock} label="Pending approval" value={counts.pendingBookings} tone="orange" />
        <StatCard icon={FiTruck} label="Available fleet" value={`${counts.availableVehicles}/${counts.totalVehicles}`} tone="emerald" />
      </div>

      {/* Today's schedule */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Pickups */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-primary-950 dark:text-white">Today's Pickups</h3>
            <Badge tone="primary">{todayPickups.length}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {todayPickups.length === 0 ? (
              <EmptySchedule icon={FiCalendar} text="No pickups scheduled today" />
            ) : (
              todayPickups.map((b) => (
                <ScheduleCard key={b._id} booking={b} type="pickup" />
              ))
            )}
          </div>
        </Card>

        {/* Returns */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-primary-950 dark:text-white">Today's Returns</h3>
            <Badge tone="cyan">{todayReturns.length}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {todayReturns.length === 0 ? (
              <EmptySchedule icon={FiCheckCircle} text="No returns expected today" />
            ) : (
              todayReturns.map((b) => (
                <ScheduleCard key={b._id} booking={b} type="return" />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SmallStat label="Active rentals" value={counts.activeBookings} />
        <SmallStat label="Pending bookings" value={counts.pendingBookings} />
        <SmallStat label="In maintenance" value={counts.inMaintenance} />
        <SmallStat label="Fleet utilization" value={counts.totalVehicles ? `${Math.round(((counts.totalVehicles - counts.availableVehicles) / counts.totalVehicles) * 100)}%` : '0%'} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    primary: 'from-primary-500/10 to-primary-600/5 text-primary-600 dark:text-primary-400',
    cyan: 'from-cyan-500/10 to-cyan-600/5 text-cyan-600 dark:text-cyan-400',
    orange: 'from-orange-500/10 to-orange-600/5 text-orange-600 dark:text-orange-400',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className="card-surface group relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${tones[tone]} opacity-50 transition-transform group-hover:scale-125`} />
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-primary-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-primary-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ScheduleCard({ booking, type }) {
  const img = booking.vehicle?.images?.[0] || PLACEHOLDER;
  const isPickup = type === 'pickup';
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary-100 p-3 transition-colors hover:bg-primary-50/50 dark:border-white/10 dark:hover:bg-white/[0.03]">
      <img src={img} alt={booking.vehicle?.name} className="h-12 w-16 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-primary-900 dark:text-white">{booking.vehicle?.name}</p>
        <div className="flex items-center gap-1 text-xs text-primary-500 dark:text-slate-400">
          <FiUser size={10} />
          <span className="truncate">{booking.user?.name}</span>
        </div>
      </div>
      <div className="text-right">
        <Badge tone={isPickup ? 'primary' : 'cyan'} className="text-[10px]">
          {isPickup ? 'Check-out' : 'Check-in'}
        </Badge>
        <p className="mt-1 text-[10px] text-primary-400 dark:text-slate-500">
          {isPickup
            ? format(new Date(booking.startDate), 'h:mm a')
            : format(new Date(booking.endDate), 'h:mm a')}
        </p>
      </div>
    </div>
  );
}

function EmptySchedule({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-200 py-8 text-center dark:border-white/10">
      <Icon size={24} className="text-primary-300 dark:text-slate-600" />
      <p className="mt-2 text-sm text-primary-400 dark:text-slate-500">{text}</p>
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="card-surface rounded-xl p-4">
      <p className="font-mono text-lg font-bold text-primary-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-primary-400 dark:text-slate-500">{label}</p>
    </div>
  );
}
