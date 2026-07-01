import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar         from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Chatbot        from './components/Chatbot.jsx';

import Home            from './pages/Home.jsx';
import Login           from './pages/Login.jsx';
import Signup          from './pages/Signup.jsx';
import ForgotPassword  from './pages/ForgotPassword.jsx';
import ResetPassword   from './pages/ResetPassword.jsx';
import VehicleList     from './pages/VehicleList.jsx';
import VehicleDetail   from './pages/VehicleDetail.jsx';
import MyBookings      from './pages/MyBookings.jsx';
import Profile         from './pages/Profile.jsx';
import Compare         from './pages/Compare.jsx';

import AdminDashboard  from './admin/AdminDashboard.jsx';
import AdminVehicles   from './admin/AdminVehicles.jsx';
import AdminUsers      from './admin/AdminUsers.jsx';
import AdminBookings   from './admin/AdminBookings.jsx';
import AdminReviews    from './admin/AdminReviews.jsx';
import AdminPromos     from './admin/AdminPromos.jsx';

const Private    = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const AdminOnly  = ({ children }) => <ProtectedRoute adminOnly>{children}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Public */}
          <Route path="/"                          element={<Home />} />
          <Route path="/login"                     element={<Login />} />
          <Route path="/signup"                    element={<Signup />} />
          <Route path="/forgot-password"           element={<ForgotPassword />} />
          <Route path="/reset-password/:token"     element={<ResetPassword />} />
          <Route path="/vehicles"                  element={<VehicleList />} />
          <Route path="/vehicles/:id"              element={<VehicleDetail />} />
          <Route path="/compare"                   element={<Compare />} />

          {/* Authenticated user */}
          <Route path="/my-bookings" element={<Private><MyBookings /></Private>} />
          <Route path="/profile"     element={<Private><Profile /></Private>} />

          {/* Admin */}
          <Route path="/admin"               element={<AdminOnly><AdminDashboard /></AdminOnly>} />
          <Route path="/admin/vehicles"      element={<AdminOnly><AdminVehicles /></AdminOnly>} />
          <Route path="/admin/users"         element={<AdminOnly><AdminUsers /></AdminOnly>} />
          <Route path="/admin/bookings"      element={<AdminOnly><AdminBookings /></AdminOnly>} />
          <Route path="/admin/reviews"       element={<AdminOnly><AdminReviews /></AdminOnly>} />
          <Route path="/admin/promos"        element={<AdminOnly><AdminPromos /></AdminOnly>} />
        </Routes>
      </main>
      <Chatbot />
    </>
  );
}
