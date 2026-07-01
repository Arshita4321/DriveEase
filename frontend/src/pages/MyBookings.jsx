import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const load = async () => {
    const { data } = await api.get('/bookings/my');
    setBookings(data);
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    await api.put(`/bookings/${id}/cancel`);
    load();
  };

  return (
    <div>
      <h2>My Bookings</h2>
      <table className="table">
        <thead>
          <tr><th>Vehicle</th><th>Dates</th><th>Total</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.vehicle?.name}</td>
              <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
              <td>${b.totalPrice}</td>
              <td>{b.status}</td>
              <td>
                {['pending', 'confirmed'].includes(b.status) && (
                  <button onClick={() => cancel(b._id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && <p>No bookings yet.</p>}
    </div>
  );
}
