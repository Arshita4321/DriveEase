import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes, useLocation } from 'react-router-dom';

import Chatbot from './components/Chatbot.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import Footer from './components/layout/Footer.jsx';
import Navbar from './components/layout/Navbar.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Compare from './pages/Compare.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import MyBookings from './pages/MyBookings.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Signup from './pages/Signup.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import VehicleList from './pages/VehicleList.jsx';

import AdminAddons from './admin/AdminAddons.jsx';
import AdminBookings from './admin/AdminBookings.jsx';
import AdminBroadcast from './admin/AdminBroadcast.jsx';
import AdminDamageReports from './admin/AdminDamageReports.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminKYC from './admin/AdminKYC.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminMaintenance from './admin/AdminMaintenance.jsx';
import AdminPromos from './admin/AdminPromos.jsx';
import AdminReviews from './admin/AdminReviews.jsx';
import AdminTasks from './admin/AdminTasks.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminVehicles from './admin/AdminVehicles.jsx';

import EmployeeBookings from './employee/EmployeeBookings.jsx';
import EmployeeDashboard from './employee/EmployeeDashboard.jsx';
import EmployeeLayout from './employee/EmployeeLayout.jsx';
import EmployeeVehicles from './employee/EmployeeVehicles.jsx';

const Private = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const AdminOnly = ({ children }) => <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
const EmployeeOnly = ({ children }) => <ProtectedRoute employeeOnly>{children}</ProtectedRoute>;

export default function App() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEmployeeRoute = location.pathname.startsWith('/employee');
  const hideChrome = isAdminRoute || isEmployeeRoute;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm font-medium',
          style: { borderRadius: '12px', background: 'var(--toast-bg)', color: 'var(--toast-text)' },
          success: { iconTheme: { primary: '#5B54F0', secondary: '#fff' } },
        }}
      />
      <CommandPalette open={paletteOpen} onClose={closePalette} />

      {!hideChrome && <Navbar onOpenCommandPalette={() => setPaletteOpen(true)} />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/vehicles" element={<PageTransition><VehicleList /></PageTransition>} />
          <Route path="/vehicles/:id" element={<PageTransition><VehicleDetail /></PageTransition>} />
          <Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />

          {/* Authenticated user */}
          <Route path="/my-bookings" element={<Private><PageTransition><MyBookings /></PageTransition></Private>} />
          <Route path="/profile" element={<Private><PageTransition><Profile /></PageTransition></Private>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="damage-reports" element={<AdminDamageReports />} />
            <Route path="maintenance" element={<AdminMaintenance />} />
            <Route path="addons" element={<AdminAddons />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
          </Route>

          {/* Employee */}
          <Route path="/employee" element={<EmployeeOnly><EmployeeLayout /></EmployeeOnly>}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="bookings" element={<EmployeeBookings />} />
            <Route path="vehicles" element={<EmployeeVehicles />} />
          </Route>

          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {!hideChrome && <Footer />}
      {!hideChrome && <Chatbot />}
    </>
  );
}
