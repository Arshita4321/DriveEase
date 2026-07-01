import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderValue: 0, maxUses: 0, expiresAt: '', isActive: true,
};

export default function AdminPromos() {
  const [promos,     setPromos]    = useState([]);
  const [form,       setForm]      = useState(emptyForm);
  const [editingId,  setEditingId] = useState(null);
  const [message,    setMessage]   = useState('');

  const load = async () => {
    const { data } = await api.get('/promos');
    setPromos(data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) await api.put(`/promos/${editingId}`, form);
      else           await api.post('/promos', form);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save promo');
    }
  };

  const edit = (p) => { setForm({ ...p, expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '' }); setEditingId(p._id); };

  const remove = async (id) => {
    if (!confirm('Delete this promo?')) return;
    await api.delete(`/promos/${id}`);
    load();
  };

  const toggleActive = async (p) => {
    await api.put(`/promos/${p._id}`, { ...p, isActive: !p.isActive });
    load();
  };

  return (
    <AdminLayout>
      <h2>Promo Codes</h2>

      <form onSubmit={submit} className="admin-form">
        <input placeholder="Code (e.g. SAVE20)" required value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <input placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat ($)</option>
        </select>
        <input type="number" placeholder="Discount value" required value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
        <input type="number" placeholder="Min order value ($)" value={form.minOrderValue}
          onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
        <input type="number" placeholder="Max uses (0 = unlimited)" value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
        <input type="date" placeholder="Expires at" value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        <label>
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'} Promo</button>
        {editingId && <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>Cancel</button>}
      </form>
      {message && <p className="error">{message}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Code</th><th>Type</th><th>Value</th><th>Min Order</th>
            <th>Max Uses</th><th>Used</th><th>Expires</th><th>Active</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p._id}>
              <td><strong>{p.code}</strong></td>
              <td>{p.discountType}</td>
              <td>{p.discountType === 'percentage' ? `${p.discountValue}%` : `$${p.discountValue}`}</td>
              <td>${p.minOrderValue}</td>
              <td>{p.maxUses || '∞'}</td>
              <td>{p.usedCount}</td>
              <td>{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '—'}</td>
              <td>
                <button onClick={() => toggleActive(p)} className={p.isActive ? 'badge-green' : 'badge-red'}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>
                <button onClick={() => edit(p)}>Edit</button>
                <button onClick={() => remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {promos.length === 0 && <p>No promo codes yet.</p>}
    </AdminLayout>
  );
}
