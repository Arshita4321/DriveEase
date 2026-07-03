import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiEye, FiShield, FiXCircle } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const statusTone = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function AdminKYC() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/kyc', { params: { status: filter } })
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const approve = async (userId) => {
    setActing(true);
    try {
      await api.put(`/admin/kyc/${userId}/approve`);
      setUsers((us) => us.filter((u) => u._id !== userId));
      toast.success('KYC approved');
    } catch { toast.error('Could not approve KYC'); }
    finally { setActing(false); }
  };

  const confirmReject = async () => {
    setActing(true);
    try {
      await api.put(`/admin/kyc/${rejecting._id}/reject`, { note: rejectNote });
      setUsers((us) => us.filter((u) => u._id !== rejecting._id));
      toast.success('KYC rejected');
      setRejecting(null);
      setRejectNote('');
    } catch { toast.error('Could not reject KYC'); }
    finally { setActing(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">KYC Verification</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{users.length} {filter} submissions</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} containerClassName="w-44">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={FiShield} title="No KYC submissions" description={`No ${filter} KYC requests at this time.`} />
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">License #</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-grad-primary text-xs font-bold text-white">
                        {u.name?.[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-primary-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-primary-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-primary-600 dark:text-slate-300">{u.licenseNumber}</td>
                  <td className="px-4 py-3 text-xs text-primary-500 dark:text-slate-400">
                    {u.kycSubmittedAt ? format(new Date(u.kycSubmittedAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3"><Badge tone={statusTone[u.kycStatus]}>{u.kycStatus}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setViewing(u)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEye size={14} /></button>
                      {filter === 'pending' && (
                        <>
                          <button onClick={() => approve(u._id)} disabled={acting} className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-white/10"><FiCheckCircle size={14} /></button>
                          <button onClick={() => setRejecting(u)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-white/10"><FiXCircle size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View documents modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="KYC Documents" maxWidth="max-w-2xl">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-3 dark:bg-white/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grad-primary text-xs font-bold text-white">
                {viewing.name?.[0]?.toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-primary-900 dark:text-white">{viewing.name}</p>
                <p className="text-xs text-primary-400">{viewing.email} · {viewing.licenseNumber}</p>
              </div>
              <Badge tone={statusTone[viewing.kycStatus]} className="ml-auto">{viewing.kycStatus}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-sm font-medium text-primary-900 dark:text-slate-200">Driving License</p>
                <img src={viewing.licenseImage} alt="License" className="w-full rounded-xl border border-primary-100 dark:border-white/10" />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-primary-900 dark:text-slate-200">ID Proof</p>
                <img src={viewing.idProofImage} alt="ID Proof" className="w-full rounded-xl border border-primary-100 dark:border-white/10" />
              </div>
            </div>
            {viewing.kycStatus === 'pending' && (
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="danger" icon={FiXCircle} onClick={() => { setRejecting(viewing); setViewing(null); }}>Reject</Button>
                <Button variant="primary" icon={FiCheckCircle} loading={acting} onClick={() => approve(viewing._id)}>Approve</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject KYC">
        <p className="text-sm text-primary-600 dark:text-slate-300">
          Rejecting KYC for <strong>{rejecting?.name}</strong>. Please provide a reason:
        </p>
        <Input
          className="mt-3"
          placeholder="e.g. License photo is blurry"
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="danger" loading={acting} onClick={confirmReject}>Confirm rejection</Button>
        </div>
      </Modal>
    </div>
  );
}
