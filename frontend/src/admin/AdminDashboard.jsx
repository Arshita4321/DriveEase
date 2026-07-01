import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <AdminLayout><p>Loading...</p></AdminLayout>;

  const monthLabels = stats.monthlyRevenue.map((m) => ({
    name: `${m._id.month}/${m._id.year}`,
    revenue: m.revenue,
    bookings: m.bookings,
  }));

  const statusData = stats.bookingsByStatus.map((s) => ({ name: s._id, value: s.count }));

  return (
    <AdminLayout>
      <h2>Admin Dashboard</h2>
      <div className="stat-grid">
        <div className="stat-card"><h4>Total Users</h4><p>{stats.totalUsers}</p></div>
        <div className="stat-card"><h4>Total Vehicles</h4><p>{stats.totalVehicles}</p></div>
        <div className="stat-card"><h4>Available</h4><p>{stats.availableVehicles}</p></div>
        <div className="stat-card"><h4>Rented</h4><p>{stats.rentedVehicles}</p></div>
        <div className="stat-card"><h4>Active Bookings</h4><p>{stats.activeBookings}</p></div>
        <div className="stat-card"><h4>Total Revenue</h4><p>${stats.totalRevenue}</p></div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h4>Monthly Revenue</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthLabels}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="revenue" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h4>Bookings by Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
