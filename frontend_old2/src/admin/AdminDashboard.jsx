import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { FiUsers, FiTruck, FiCalendar, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = { pending: '#FB923C', confirmed: '#5B54F0', cancelled: '#EF4444', completed: '#06B6D4' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const revenueData = stats.monthlyRevenue.map((m) => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    revenue: m.revenue,
    bookings: m.bookings,
  }));

  const statusData = stats.bookingsByStatus.map((s) => ({ name: s._id, value: s.count }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
        Dashboard overview
      </h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Real-time performance across the platform.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Total users" value={stats.totalUsers} tone="primary" />
        <StatCard icon={FiTruck} label="Vehicles listed" value={stats.totalVehicles} tone="cyan" />
        <StatCard icon={FiCalendar} label="Active bookings" value={stats.activeBookings} tone="orange" />
        <StatCard icon={FiDollarSign} label="Total revenue" value={stats.totalRevenue} prefix="₹" tone="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-display font-semibold text-primary-950 dark:text-white">Revenue — last 6 months</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B54F0" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#5B54F0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-primary-100 dark:text-white/10" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#5B54F0" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="font-display font-semibold text-primary-950 dark:text-white">Bookings by status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusData.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card>
          <h3 className="font-display font-semibold text-primary-950 dark:text-white">Bookings volume</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="text-primary-100 dark:text-white/10" stroke="currentColor" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="bookings" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SmallStat label="Available vehicles" value={stats.availableVehicles} />
        <SmallStat label="Rented out" value={stats.rentedVehicles} />
        <SmallStat label="Total bookings" value={stats.totalBookings} />
        <SmallStat label="Avg. revenue / booking" value={stats.totalBookings ? Math.round(stats.totalRevenue / stats.totalBookings) : 0} prefix="₹" />
      </div>
    </div>
  );
}

function SmallStat({ label, value, prefix = '' }) {
  return (
    <div className="card-surface rounded-xl p-4">
      <p className="font-mono text-lg font-bold text-primary-900 dark:text-white">{prefix}{value?.toLocaleString?.() ?? value}</p>
      <p className="mt-0.5 text-xs text-primary-400 dark:text-slate-500">{label}</p>
    </div>
  );
}
