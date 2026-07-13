import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiInbox } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import EmptyState from './ui/EmptyState';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotes(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAll = async () => {
    setNotes((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    await api.put('/notifications/mark-all-read');
  };

  const markOne = async (id) => {
    setNotes((n) => n.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    await api.put(`/notifications/${id}/read`);
  };

  const remove = async (id) => {
    setNotes((n) => n.filter((x) => x._id !== id));
    await api.delete(`/notifications/${id}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="btn-focus-ring relative rounded-xl p-2.5 text-primary-500 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-white/10"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-orange" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-orange" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="glass-strong absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl shadow-2xl sm:w-96"
            >
              <div className="flex items-center justify-between border-b border-primary-100 px-4 py-3 dark:border-white/10">
                <h4 className="font-display text-sm font-semibold text-primary-950 dark:text-white">
                  Notifications
                </h4>
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-700 dark:text-primary-300"
                  >
                    <FiCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {loading && notes.length === 0 && (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-14 rounded-xl" />
                    ))}
                  </div>
                )}
                {!loading && notes.length === 0 && (
                  <EmptyState icon={FiInbox} title="No notifications yet" description="Booking updates and offers will show up here." />
                )}
                {notes.map((n) => (
                  <div
                    key={n._id}
                    className={`group relative mb-1 rounded-xl px-3 py-2.5 transition-colors ${
                      n.isRead ? 'hover:bg-primary-50 dark:hover:bg-white/5' : 'bg-primary-50/70 dark:bg-primary-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1" onClick={() => !n.isRead && markOne(n._id)}>
                        <p className="text-sm font-medium text-primary-900 dark:text-white">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-primary-500 dark:text-slate-400">{n.message}</p>
                        <p className="mt-1 text-[11px] text-primary-300 dark:text-slate-500">
                          {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(n._id)}
                        className="rounded-lg p-1.5 text-primary-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                        aria-label="Delete notification"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                    {!n.isRead && (
                      <span className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
