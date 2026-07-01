import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [form,    setForm]    = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');
  const fileRef = useRef();

  const load = async () => {
    const [p, s] = await Promise.all([api.get('/users/profile'), api.get('/users/stats')]);
    setProfile(p.data);
    setStats(s.data);
    setForm({ name: p.data.name, phone: p.data.phone || '' });
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/users/profile', form);
      setMessage('Profile updated!');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await api.put('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } catch (err) {
      setMessage('Avatar upload failed');
    }
  };

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      {/* Avatar */}
      <div className="avatar-section">
        <img
          src={profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name)}
          alt="avatar"
          className="avatar-img"
        />
        <button onClick={() => fileRef.current.click()}>Change Photo</button>
        <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={uploadAvatar} />
      </div>

      {/* Stats */}
      {stats && (
        <div className="stat-grid">
          <div className="stat-card"><h4>Total Bookings</h4><p>{stats.totalBookings}</p></div>
          <div className="stat-card"><h4>Completed Trips</h4><p>{stats.completedTrips}</p></div>
          <div className="stat-card"><h4>Cancelled</h4><p>{stats.cancelledBookings}</p></div>
          <div className="stat-card"><h4>Total Spent</h4><p>${stats.totalSpent}</p></div>
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={save} className="profile-form">
        <h3>Edit Details</h3>
        <label>Full Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <p><strong>Email:</strong> {profile.email} (cannot be changed)</p>
        <button type="submit" className="btn-primary">Save Changes</button>
        {message && <p>{message}</p>}
      </form>

      {/* Wishlist */}
      <div className="wishlist-section">
        <h3>My Wishlist ❤️</h3>
        {profile.wishlist?.length === 0 && <p>No saved vehicles yet.</p>}
        <div className="grid">
          {profile.wishlist?.map((v) => (
            <Link to={`/vehicles/${v._id}`} key={v._id} className="card">
              {v.images?.[0]
                ? <img src={v.images[0]} alt={v.name} className="card-img" />
                : <div className="card-img-placeholder">{v.type === 'car' ? '🚗' : '🏍️'}</div>}
              <h3>{v.name}</h3>
              <p>${v.pricePerDay}/day • {v.location}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
