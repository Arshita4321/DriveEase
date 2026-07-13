import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const load = async () => {
    const { data } = await api.get('/reviews');
    setReviews(data);
  };

  useEffect(() => { load(); }, []);

  const toggleVisibility = async (id) => {
    await api.put(`/reviews/${id}/toggle-visibility`);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <h2>Manage Reviews</h2>
      <table className="table">
        <thead>
          <tr><th>User</th><th>Vehicle</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r._id}>
              <td>{r.user?.name}<br /><small>{r.user?.email}</small></td>
              <td>{r.vehicle?.name}</td>
              <td>⭐ {r.rating}</td>
              <td>{r.comment}</td>
              <td>{r.isHidden ? 'Hidden' : 'Visible'}</td>
              <td>
                <button onClick={() => toggleVisibility(r._id)}>
                  {r.isHidden ? 'Unhide' : 'Hide'}
                </button>
                <button onClick={() => remove(r._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reviews.length === 0 && <p>No reviews found.</p>}
    </AdminLayout>
  );
}
