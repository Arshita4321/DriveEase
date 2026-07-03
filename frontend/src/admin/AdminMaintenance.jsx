import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiEdit2, FiPlus, FiTool, FiTrash2 } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const statusTone = { scheduled: 'warning', in_progress: 'primary', completed: 'success' };
const typeLabels = { oil_change: 'Oil Change', tire_rotation: 'Tire Rotation', general_service: 'General Service', repair: 'Repair', inspection: 'Inspection', other: 'Other' };

const emptyForm = { vehicleId: '', type: 'general_service', description: '', cost: '', serviceDate: '', nextDueDate: '', odometer: '', performedBy: '', status: 'scheduled', notes: '' };

export default function AdminMaintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/maintenance'),
      api.get('/vehicles', { params: { limit: 100 } }),
      api.get('/maintenance/upcoming'),
    ]).then(([logsRes, vehRes, upRes]) => {
      setLogs(logsRes.data);
      setVehicles(vehRes.data.vehicles || []);
      setUpcoming(upRes.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (l) => { setEditing(l); setForm({ ...emptyForm, ...l, vehicleId: l.vehicle?._id || l.vehicle, serviceDate: l.serviceDate ? format(new Date(l.serviceDate), 'yyyy-MM-dd') : '', nextDueDate: l.nextDueDate ? format(new Date(l.nextDueDate), 'yyyy-MM-dd') : '' }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      vehicleId: form.vehicleId,
      cost: Number(form.cost) || 0,
      odometer: Number(form.odometer) || 0,
      serviceDate: new Date(form.serviceDate),
      nextDueDate: form.nextDueDate ? new Date(form.nextDueDate) : null,
    };
    try {
      if (editing) {
        const { data } = await api.put(`/maintenance/${editing._id}`, payload);
        setLogs((ls) => ls.map((l) => (l._id === editing._id ? data : l)));
        toast.success('Maintenance log updated');
      } else {
        const { data } = await api.post('/maintenance', payload);
        setLogs((ls) => [data, ...ls]);
        toast.success('Maintenance log created');
      }
      setModalOpen(false);
      load(); // reload to reflect vehicle availability changes
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save maintenance log');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    try {
      await api.delete(`/maintenance/${toDelete._id}`);
      setLogs((ls) => ls.filter((l) => l._id !== toDelete._id));
      toast.success('Maintenance log deleted');
    } catch { toast.error('Could not delete'); }
    finally { setToDelete(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Maintenance</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{logs.length} maintenance logs</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreate}>Add log</Button>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
          <FiAlertCircle className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{upcoming.length} upcoming maintenance due</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{upcoming.map((u) => `${u.vehicle?.name} (${u.nextDueDate ? format(new Date(u.nextDueDate), 'MMM d') : '—'})`).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FiTool} title="No maintenance logs" description="Add a maintenance log to track vehicle service history." action={<Button onClick={openCreate}>Add log</Button>} />
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Service date</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Next due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900 dark:text-white">{l.vehicle?.name}</p>
                    <p className="text-xs text-primary-400 capitalize">{l.vehicle?.type} · {l.vehicle?.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-primary-600 dark:text-slate-300">{typeLabels[l.type] || l.type}</td>
                  <td className="px-4 py-3 text-xs text-primary-500 dark:text-slate-400">{format(new Date(l.serviceDate), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 font-mono text-primary-900 dark:text-white">{l.cost > 0 ? `₹${l.cost}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-primary-500 dark:text-slate-400">{l.nextDueDate ? format(new Date(l.nextDueDate), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[l.status]}>{l.status.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(l)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEdit2 size={14} /></button>
                      <button onClick={() => setToDelete(l)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit maintenance log' : 'Add maintenance log'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Vehicle" required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </Select>
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(typeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </Select>
            <Input label="Service date" type="date" required value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />
            <Input label="Next due date" type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} />
            <Input label="Cost (₹)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            <Input label="Odometer (km)" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            <Input label="Performed by" value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} placeholder="Service center name" />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing ? 'Save changes' : 'Add log'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete maintenance log?">
        <p className="text-sm text-primary-600 dark:text-slate-300">This will permanently remove this maintenance log.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
