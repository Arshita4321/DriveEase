import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">DriveEase</Link>
      <nav className="nav-links">
        <Link to="/vehicles">Browse</Link>
        <Link to="/compare">Compare</Link>
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign Up</Link>}
        {user && <NotificationBell />}
        {user && (
          <button className="link-btn" onClick={() => { logout(); navigate('/'); }}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
