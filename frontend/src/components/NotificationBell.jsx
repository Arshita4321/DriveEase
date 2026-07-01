import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell() {
  const [data, setData]       = useState({ notifications: [], unreadCount: 0 });
  const [open, setOpen]       = useState(false);
  const ref                   = useRef();
  const navigate              = useNavigate();

  const load = async () => {
    try {
      const { data: res } = await api.get('/notifications');
      setData(res);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await api.put('/notifications/mark-all-read');
    load();
  };

  const clickNote = async (n) => {
    await api.put(`/notifications/${n._id}/read`);
    setOpen(false);
    if (n.link) navigate(n.link);
    load();
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button className="bell-btn" onClick={() => setOpen((o) => !o)}>
        🔔
        {data.unreadCount > 0 && <span className="bell-badge">{data.unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {data.unreadCount > 0 && <button onClick={markAll}>Mark all read</button>}
          </div>
          {data.notifications.length === 0 && <p className="notif-empty">No notifications yet.</p>}
          {data.notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${n.isRead ? '' : 'unread'}`}
              onClick={() => clickNote(n)}
            >
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
