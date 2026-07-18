import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiZap, FiHeart } from 'react-icons/fi';

const perks = [
  { icon: FiZap, text: 'Instant booking confirmation' },
  { icon: FiShield, text: 'Verified, insured vehicles' },
  { icon: FiHeart, text: 'Free cancellation up to 24h' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-grad-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 15l1.5-4.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="16.5" r="1.6" fill="white" />
              <circle cx="16.5" cy="16.5" r="1.6" fill="white" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold text-white">DriveEase</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            Your next journey is a few clicks away.
          </h2>
          <div className="mt-6 space-y-3">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <p.icon size={14} />
                </span>
                <span className="text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-primary-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-primary-500 dark:text-slate-400">{footer}</p>}
        </motion.div>
      </div>
    </div>
  );
}
