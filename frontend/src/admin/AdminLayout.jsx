import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/admin',           label: '📊 Dashboard' },
  { to: '/admin/vehicles',  label: '🚗 Vehicles'  },
  { to: '/admin/users',     label: '👥 Users'     },
  { to: '/admin/bookings',  label: '📋 Bookings'  },
  { to: '/admin/reviews',   label: '⭐ Reviews'   },
  { to: '/admin/promos',    label: '🏷️ Promos'    },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="sidebar-title">Admin Panel</p>
        {TABS.map((t) => (
          <Link key={t.to} to={t.to} className={pathname === t.to ? 'active' : ''}>{t.label}</Link>
        ))}
      </aside>
      <section className="admin-content">{children}</section>
    </div>
  );
}
