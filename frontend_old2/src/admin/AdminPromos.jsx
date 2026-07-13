import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, maxUses: 0, expiresAt: '', isActive: true };

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/promos').then(({ data }) => setPromos(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...emptyForm, ...p, expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '' });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, discountValue: Number(form.discountValue), minOrderValue: Number(form.minOrderValue), maxUses: Number(form.maxUses) };
    try {
      if (editing) {
        const { data } = await api.put(`/promos/${editing._id}`, payload);
        setPromos((ps) => ps.map((p) => (p._id === editing._id ? data : p)));
        toast.success('Promo updated');
      } else {
        const { data } = await api.post('/promos', payload);
        setPromos((ps) => [data, ...ps]);
        toast.success('Promo created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save promo');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/promos/${toDelete._id}`);
      setPromos((ps) => ps.filter((p) => p._id !== toDelete._id));
      toast.success('Promo deleted');
    } catch {
      toast.error('Could not delete promo');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Promo codes</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{promos.length} codes created</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreate}>New promo</Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : promos.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState icon={FiTag} title="No promo codes yet" action={<Button onClick={openCreate}>Create one</Button>} />
          </div>
        ) : (
          promos.map((p) => (
            <div key={p._id} className="card-surface rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <span className="rounded-lg bg-primary-50 px-2.5 py-1 font-mono text-sm font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">{p.code}</span>
                <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="mt-2 text-sm text-primary-600 dark:text-slate-300">{p.description || 'No description'}</p>
              <p className="mt-2 font-mono text-lg font-bold text-primary-950 dark:text-white">
                {p.discountType === 'percentage' ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
              </p>
              <p className="mt-1 text-xs text-primary-400 dark:text-slate-500">
                Used {p.usedCount}{p.maxUses > 0 ? `/${p.maxUses}` : ''} times
                {p.expiresAt && ` · Expires ${format(new Date(p.expiresAt), 'MMM d, yyyy')}`}
              </p>
              <div className="mt-3 flex gap-1.5">
                <Button size="sm" variant="secondary" icon={FiEdit2} onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setToDelete(p)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit promo code' : 'Create promo code'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Discount type" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </Select>
            <Input label="Discount value" type="number" required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            <Input label="Min order value (₹)" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
            <Input label="Max uses (0 = unlimited)" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <Input label="Expires on" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-primary-700 dark:text-slate-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded accent-primary-600" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing ? 'Save changes' : 'Create promo'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete promo code?">
        <p className="text-sm text-primary-600 dark:text-slate-300">This will permanently delete <strong>{toDelete?.code}</strong>.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
