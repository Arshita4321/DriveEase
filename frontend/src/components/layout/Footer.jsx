import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';

const cols = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse cars', to: '/vehicles?type=car' },
      { label: 'Browse bikes', to: '/vehicles?type=bike' },
      { label: 'Compare vehicles', to: '/compare' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My bookings', to: '/my-bookings' },
      { label: 'Profile', to: '/profile' },
      { label: 'Sign up', to: '/signup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Support', to: '/' },
      { label: 'Terms', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-primary-100 bg-white/60 dark:border-white/10 dark:bg-primary-950/40">
      <div className="container-px mx-auto max-w-7xl py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
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
            <p className="mt-4 max-w-xs text-sm text-primary-500 dark:text-slate-400">
              Book premium cars and bikes in minutes — transparent pricing, instant confirmation, zero hassle.
            </p>
            <div className="mt-5 flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook, FiLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-100 text-primary-400 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-semibold text-primary-900 dark:text-white">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-primary-500 hover:text-primary-700 dark:text-slate-400 dark:hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-100 pt-6 text-xs text-primary-400 dark:border-white/10 sm:flex-row">
          <p>© {new Date().getFullYear()} DriveEase. All rights reserved.</p>
          <p>Built with React, Tailwind CSS & Framer Motion.</p>
        </div>
      </div>
    </footer>
  );
}
