import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const emptyForm = { name: '', description: '', price: '', priceType: 'flat', applicableTo: 'all', isActive: true };

export default function AdminAddons() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/addons?all=true').then(({ data }) => setAddons(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...emptyForm, ...a }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editing) {
        const { data } = await api.put(`/addons/${editing._id}`, payload);
        setAddons((as) => as.map((a) => (a._id === editing._id ? data : a)));
        toast.success('Addon updated');
      } else {
        const { data } = await api.post('/addons', payload);
        setAddons((as) => [...as, data]);
        toast.success('Addon created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save addon');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    try {
      await api.delete(`/addons/${toDelete._id}`);
      setAddons((as) => as.filter((a) => a._id !== toDelete._id));
      toast.success('Addon deleted');
    } catch { toast.error('Could not delete addon'); }
    finally { setToDelete(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Add-ons</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{addons.length} add-ons configured</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreate}>Add add-on</Button>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : addons.length === 0 ? (
          <EmptyState icon={FiPackage} title="No add-ons yet" description="Create add-ons like GPS, child seat, or insurance for users to select at booking." action={<Button onClick={openCreate}>Add add-on</Button>} />
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Applies to</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((a) => (
                <tr key={a._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900 dark:text-white">{a.name}</p>
                    <p className="text-xs text-primary-400">{a.description}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-primary-900 dark:text-white">₹{a.price}{a.priceType === 'per_day' ? '/day' : ''}</td>
                  <td className="px-4 py-3 text-primary-600 dark:text-slate-300">{a.priceType === 'per_day' ? 'Per day' : 'Flat'}</td>
                  <td className="px-4 py-3 capitalize text-primary-600 dark:text-slate-300">{a.applicableTo}</td>
                  <td className="px-4 py-3"><Badge tone={a.isActive ? 'success' : 'neutral'}>{a.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(a)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEdit2 size={14} /></button>
                      <button onClick={() => setToDelete(a)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit add-on' : 'Add add-on'}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. GPS Navigator" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Select label="Price type" value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}>
              <option value="flat">Flat (one-time)</option>
              <option value="per_day">Per day</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Applies to" value={form.applicableTo} onChange={(e) => setForm({ ...form, applicableTo: e.target.value })}>
              <option value="all">All vehicles</option>
              <option value="car">Cars only</option>
              <option value="bike">Bikes only</option>
            </Select>
            <Select label="Status" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing ? 'Save changes' : 'Add add-on'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete add-on?">
        <p className="text-sm text-primary-600 dark:text-slate-300">This will permanently remove <strong>{toDelete?.name}</strong>.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
