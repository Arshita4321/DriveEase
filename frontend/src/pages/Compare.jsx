import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const ROW_LABELS = [
  { key: 'type',         label: 'Type' },
  { key: 'brand',        label: 'Brand' },
  { key: 'year',         label: 'Year' },
  { key: 'pricePerDay',  label: 'Price/day',    fmt: (v) => `$${v}` },
  { key: 'transmission', label: 'Transmission' },
  { key: 'fuelType',     label: 'Fuel' },
  { key: 'seats',        label: 'Seats' },
  { key: 'location',     label: 'Location' },
  { key: 'averageRating',label: 'Rating',       fmt: (v) => `⭐ ${v || 'N/A'}` },
  { key: 'isAvailable',  label: 'Status',       fmt: (v) => v ? '✅ Available' : '❌ Unavailable' },
];

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids            = (searchParams.get('ids') || '').split(',').filter(Boolean);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    Promise.all(ids.map((id) => api.get(`/vehicles/${id}`)))
      .then((results) => setVehicles(results.map((r) => r.data)))
      .catch(() => {});
  }, []); // eslint-disable-line

  if (ids.length < 2) return <div><h2>Compare</h2><p>Select at least 2 vehicles from the <Link to="/vehicles">browse page</Link> to compare.</p></div>;
  if (vehicles.length === 0) return <p>Loading vehicles…</p>;

  return (
    <div>
      <h2>Vehicle Comparison</h2>
      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              {vehicles.map((v) => (
                <th key={v._id}>
                  {v.images?.[0]
                    ? <img src={v.images[0]} alt={v.name} style={{ width: 120, borderRadius: 6 }} />
                    : <span style={{ fontSize: 36 }}>{v.type === 'car' ? '🚗' : '🏍️'}</span>}
                  <br />
                  <Link to={`/vehicles/${v._id}`}>{v.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map(({ key, label, fmt }) => (
              <tr key={key}>
                <td className="row-label">{label}</td>
                {vehicles.map((v) => (
                  <td key={v._id}>{fmt ? fmt(v[key]) : v[key] || '–'}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              {vehicles.map((v) => (
                <td key={v._id}>
                  <Link to={`/vehicles/${v._id}`} className="btn-primary">Book {v.name}</Link>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
