import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
    FiAlertTriangle,
    FiArrowLeft,
    FiBell,
    FiCalendar,
    FiClipboard,
    FiGrid,
    FiMenu,
    FiPackage,
    FiShield,
    FiStar, FiTag,
    FiTool,
    FiTruck, FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link, NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/vehicles', label: 'Vehicles', icon: FiTruck },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
  { to: '/admin/tasks', label: 'Tasks', icon: FiClipboard },
  { to: '/admin/broadcast', label: 'Broadcast', icon: FiBell },
  { to: '/admin/kyc', label: 'KYC Verify', icon: FiShield },
  { to: '/admin/damage-reports', label: 'Damage Reports', icon: FiAlertTriangle },
  { to: '/admin/maintenance', label: 'Maintenance', icon: FiTool },
  { to: '/admin/addons', label: 'Add-ons', icon: FiPackage },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/promos', label: 'Promo codes', icon: FiTag },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <>
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-primary text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 15l1.5-4.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7.5" cy="16.5" r="1.6" fill="white" />
            <circle cx="16.5" cy="16.5" r="1.6" fill="white" />
          </svg>
        </span>
        <span className="font-display text-lg font-bold text-primary-950 dark:text-white">
          Drive<span className="text-gradient">Ease</span>
        </span>
      </Link>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-primary-300 dark:text-slate-500">
        Admin panel
      </p>
      <nav className="space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-grad-primary text-white shadow-glow'
                  : 'text-primary-500 hover:bg-primary-50 dark:text-slate-400 dark:hover:bg-white/5'
              }`
            }
          >
            <l.icon size={16} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-primary-100 pt-4 dark:border-white/10">
        <Link to="/" className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-primary-500 hover:bg-primary-50 dark:text-slate-400 dark:hover:bg-white/5">
          <FiArrowLeft size={16} /> Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-primary-100 p-4 dark:border-white/10 lg:block">
          {SidebarContent}
        </aside>

        {/* Mobile topbar */}
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-primary-100 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90 lg:hidden">
          <span className="font-display font-bold text-primary-950 dark:text-white">Admin panel</span>
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-primary-600 dark:text-white">
            <FiMenu size={20} />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="glass-strong fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto p-4 lg:hidden"
              >
                <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-primary-500">
                  <FiX size={18} />
                </button>
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-5 pt-20 sm:p-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
