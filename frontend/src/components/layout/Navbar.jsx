import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    FiCalendar,
    FiChevronDown,
    FiCommand,
    FiHeart,
    FiLogOut,
    FiMenu,
    FiMoon, FiSearch,
    FiSettings,
    FiSun,
    FiUser,
    FiX,
} from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../NotificationBell';
import Button from '../ui/Button';

const navLinks = [
  { to: '/vehicles?type=car', label: 'Cars' },
  { to: '/vehicles?type=bike', label: 'Bikes' },
  { to: '/vehicles', label: 'Browse all' },
  { to: '/compare', label: 'Compare' },
  { to: '/guide', label: 'Guide & Tour' },
];

export default function Navbar({ onOpenCommandPalette }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-card' : 'bg-transparent'
      }`}
    >
      <nav className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-primary text-white shadow-glow">
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

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-300'
                    : 'text-primary-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="btn-focus-ring hidden items-center gap-2 rounded-xl border border-primary-100 bg-white/70 px-3 py-2 text-xs text-primary-400 hover:border-primary-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 sm:flex"
          >
            <FiSearch size={14} />
            <span className="hidden md:inline">Search vehicles…</span>
            <kbd className="ml-1 hidden items-center gap-0.5 rounded-md bg-primary-50 px-1.5 py-0.5 font-mono text-[10px] text-primary-500 dark:bg-white/10 dark:text-slate-400 md:flex">
              <FiCommand size={10} />K
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="btn-focus-ring rounded-xl p-2.5 text-primary-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {user && <NotificationBell />}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="btn-focus-ring flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-primary-50 dark:hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-grad-primary text-xs font-bold text-white">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                </span>
                <FiChevronDown size={14} className="hidden text-primary-400 sm:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="glass-strong absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
                    >
                      <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-primary-950 dark:text-white">{user.name}</p>
                        <p className="truncate text-xs text-primary-400 dark:text-slate-400">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-primary-100 dark:bg-white/10" />
                      <MenuLink to="/profile" icon={FiUser} onClick={() => setProfileOpen(false)}>Profile</MenuLink>
                      <MenuLink to="/my-bookings" icon={FiCalendar} onClick={() => setProfileOpen(false)}>My bookings</MenuLink>
                      <MenuLink to="/profile?tab=wishlist" icon={FiHeart} onClick={() => setProfileOpen(false)}>Wishlist</MenuLink>
                      {user.role === 'admin' && (
                        <MenuLink to="/admin" icon={FiSettings} onClick={() => setProfileOpen(false)}>Admin panel</MenuLink>
                      )}
                      {(user.role === 'employee' || user.role === 'admin') && (
                        <MenuLink to="/employee" icon={FiSettings} onClick={() => setProfileOpen(false)}>Employee panel</MenuLink>
                      )}
                      <div className="my-1 h-px bg-primary-100 dark:bg-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <FiLogOut size={15} /> Log out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
              <Button as={Link} to="/signup" variant="primary" size="sm">Sign up</Button>
            </div>
          )}

          <button
            className="btn-focus-ring rounded-xl p-2.5 text-primary-600 dark:text-white lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass-strong lg:hidden"
          >
            <div className="container-px mx-auto flex flex-col gap-1 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  {l.label}
                </Link>
              ))}
              {!user && (
                <div className="mt-2 flex gap-2 px-1">
                  <Button as={Link} to="/login" variant="secondary" className="flex-1 justify-center" onClick={() => setMobileOpen(false)}>Log in</Button>
                  <Button as={Link} to="/signup" variant="primary" className="flex-1 justify-center" onClick={() => setMobileOpen(false)}>Sign up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-white/10"
    >
      <Icon size={15} className="text-primary-400" /> {children}
    </Link>
  );
}
