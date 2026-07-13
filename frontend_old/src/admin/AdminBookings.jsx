import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');

  const load = async () => {
    const { data } = await api.get('/bookings', { params: filter ? { status: filter } : {} });
    setBookings(data);
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    load();
  };

  return (
    <AdminLayout>
      <h2>Manage Bookings</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All Statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <table className="table">
        <thead>
          <tr><th>User</th><th>Vehicle</th><th>Dates</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.user?.name} <br /><small>{b.user?.email}</small></td>
              <td>{b.vehicle?.name}</td>
              <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
              <td>${b.totalPrice}</td>
              <td>{b.paymentStatus}</td>
              <td>{b.status}</td>
              <td>
                <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p>No bookings found.</p>}
    </AdminLayout>
  );
}
