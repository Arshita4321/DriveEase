import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiEye } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const statusTone = { reported: 'warning', reviewed: 'primary', resolved: 'success', charged: 'danger' };
const severityTone = { none: 'neutral', minor: 'warning', moderate: 'primary', severe: 'danger' };

export default function AdminDamageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: '', severity: '', penaltyAmount: 0, adminNote: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/damage-reports', { params: filter ? { status: filter } : {} })
      .then(({ data }) => setReports(data))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const openEdit = (r) => {
    setEditing(r);
    setForm({ status: r.status, severity: r.severity, penaltyAmount: r.penaltyAmount, adminNote: r.adminNote || '' });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/damage-reports/${editing._id}`, form);
      setReports((rs) => rs.map((r) => (r._id === editing._id ? data : r)));
      toast.success('Damage report updated');
      setEditing(null);
    } catch { toast.error('Could not update report'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Damage Reports</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{reports.length} reports</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} containerClassName="w-44">
          <option value="">All statuses</option>
          <option value="reported">Reported</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="charged">Charged</option>
        </Select>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FiAlertTriangle} title="No damage reports" description="Damage reports submitted by users will appear here." />
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Penalty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900 dark:text-white">{r.vehicle?.name}</p>
                    <p className="text-xs text-primary-400">{r.booking ? format(new Date(r.booking.startDate), 'MMM d') : '—'} – {r.booking ? format(new Date(r.booking.endDate), 'MMM d, yyyy') : '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-primary-900 dark:text-white">{r.user?.name}</p>
                    <p className="text-xs text-primary-400">{r.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-primary-600 dark:text-slate-300">{r.type}</td>
                  <td className="px-4 py-3"><Badge tone={severityTone[r.severity]}>{r.severity}</Badge></td>
                  <td className="px-4 py-3 font-mono text-primary-900 dark:text-white">{r.penaltyAmount > 0 ? `₹${r.penaltyAmount}` : '—'}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Review Damage Report" maxWidth="max-w-2xl">
        {editing && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {editing.photos?.map((p, i) => (
                <img key={i} src={p} alt={`Damage ${i + 1}`} className="h-24 w-32 rounded-xl border border-primary-100 object-cover dark:border-white/10" />
              ))}
            </div>
            <div className="rounded-xl bg-primary-50 p-3 dark:bg-white/5">
              <p className="text-sm text-primary-600 dark:text-slate-300">{editing.description || 'No description provided.'}</p>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="reported">Reported</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="charged">Charged</option>
                </Select>
                <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="none">None</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </Select>
              </div>
              <Input label="Penalty amount (₹)" type="number" value={form.penaltyAmount} onChange={(e) => setForm({ ...form, penaltyAmount: Number(e.target.value) })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">Admin note</label>
                <textarea
                  rows={3}
                  value={form.adminNote}
                  onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
                  className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
