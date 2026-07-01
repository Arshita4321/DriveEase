import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import WishlistButton from '../components/WishlistButton.jsx';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filters,  setFilters]  = useState({ type: '', location: '', minPrice: '', maxPrice: '', search: '', sort: '' });
  const [loading,  setLoading]  = useState(false);
  const [compare,  setCompare]  = useState([]);   // up to 3 vehicle ids
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/vehicles', { params });
      setVehicles(data.vehicles);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []); // eslint-disable-line

  const toggleCompare = (id) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goCompare = () => navigate(`/compare?ids=${compare.join(',')}`);

  return (
    <div>
      <h2>Browse Vehicles</h2>

      {/* Filters */}
      <form className="filters" onSubmit={(e) => { e.preventDefault(); fetchVehicles(); }}>
        <input placeholder="Search by name / brand" value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
        <input placeholder="Location" value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input type="number" placeholder="Min $" value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input type="number" placeholder="Max $" value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="">Sort by</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="rating">Top Rated</option>
        </select>
        <button type="submit" className="btn-primary">Apply</button>
      </form>

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="compare-bar">
          <span>{compare.length} vehicle{compare.length > 1 ? 's' : ''} selected</span>
          <button className="btn-primary" onClick={goCompare} disabled={compare.length < 2}>
            Compare Now
          </button>
          <button onClick={() => setCompare([])}>Clear</button>
        </div>
      )}

      {loading ? <p>Loading…</p> : (
        <div className="grid">
          {vehicles.map((v) => (
            <div key={v._id} className="card-wrapper">
              <Link to={`/vehicles/${v._id}`} className="card">
                {v.images?.[0]
                  ? <img src={v.images[0]} alt={v.name} className="card-img" />
                  : <div className="card-img-placeholder">{v.type === 'car' ? '🚗' : '🏍️'}</div>
                }
                <h3>{v.name}</h3>
                <p>{v.brand} • {v.location}</p>
                <p><strong>${v.pricePerDay}/day</strong></p>
                <p>{v.isAvailable ? '✅ Available' : '❌ Unavailable'} • ⭐ {v.averageRating || 'New'}</p>
              </Link>
              <div className="card-actions">
                <WishlistButton vehicleId={v._id} />
                <label className="compare-toggle">
                  <input
                    type="checkbox"
                    checked={compare.includes(v._id)}
                    onChange={() => toggleCompare(v._id)}
                    disabled={!compare.includes(v._id) && compare.length >= 3}
                  />
                  Compare
                </label>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p>No vehicles match your filters.</p>}
        </div>
      )}
    </div>
  );
}
