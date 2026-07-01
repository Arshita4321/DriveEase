import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'user' });

  const load = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (id) => {
    await api.put(`/admin/users/${id}/toggle-block`);
    load();
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role });
  };

  const saveEdit = async (id) => {
    await api.put(`/admin/users/${id}`, editForm);
    setEditingId(null);
    load();
  };

  return (
    <AdminLayout>
      <h2>Manage Users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Role</th>
            <th>Status</th><th>Last Login</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              {editingId === u._id ? (
                <>
                  <td><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                  <td><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                  <td><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></td>
                  <td>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
                  <td>
                    <button onClick={() => saveEdit(u._id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role}</td>
                  <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td>
                  <td>
                    <button onClick={() => startEdit(u)}>Edit</button>
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleBlock(u._id)}>
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p>No users found.</p>}
    </AdminLayout>
  );
}
