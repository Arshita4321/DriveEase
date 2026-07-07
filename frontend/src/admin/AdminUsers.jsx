import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiEdit2, FiPlus, FiSearch, FiSlash, FiUsers } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const ROLE_TONE = { admin: 'primary', employee: 'cyan', user: 'neutral' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', role: 'employee' });
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleBlock = async (u) => {
    try {
      const { data } = await api.put(`/admin/users/${u._id}/toggle-block`);
      setUsers((us) => us.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/users/${editing._id}`, form);
      setUsers((us) => us.map((x) => (x._id === editing._id ? data : x)));
      toast.success('User updated');
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/users', createForm);
      toast.success(`${createForm.role === 'admin' ? 'Admin' : 'Employee'} created`);
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'employee' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{users.length} registered users</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="user">Users</option>
            <option value="employee">Employees</option>
            <option value="admin">Admins</option>
          </Select>
          <Button variant="primary" icon={FiPlus} onClick={() => setCreateOpen(true)}>Add staff</Button>
        </div>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiUsers} title="No users found" />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
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
                  <td className="px-4 py-3"><Badge tone={ROLE_TONE[u.role] || 'neutral'}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-primary-500 dark:text-slate-400">{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3"><Badge tone={u.isBlocked ? 'danger' : 'success'}>{u.isBlocked ? 'Blocked' : 'Active'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(u)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEdit2 size={14} /></button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlock(u)}
                          className={`rounded-lg p-2 ${u.isBlocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'} dark:hover:bg-white/10`}
                        >
                          {u.isBlocked ? <FiCheckCircle size={14} /> : <FiSlash size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit user">
        <form onSubmit={save} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add new staff member">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Password" type="password" required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
          <Input label="Phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
          <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={creating}>Create {createForm.role}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
