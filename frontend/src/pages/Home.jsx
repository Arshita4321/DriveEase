import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="hero">
      <h1>Find your next ride with DriveEase</h1>
      <p>Cars and bikes for rent, available across multiple cities. Transparent pricing, instant booking.</p>
      <Link to="/vehicles" className="btn-primary">Browse Vehicles</Link>
    </div>
  );
}
