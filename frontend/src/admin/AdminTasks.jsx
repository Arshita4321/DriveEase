import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClipboard, FiMail, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const PRIORITY_TONE = { low: 'neutral', medium: 'primary', high: 'warning', urgent: 'danger' };
const STATUS_TONE = { open: 'primary', in_progress: 'warning', completed: 'success', cancelled: 'neutral' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    selectedEmails: [],
    emailInput: '',
  });

  const load = () => {
    setLoading(true);
    api.get('/tasks').then(({ data }) => setTasks(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/tasks/employee-emails').then(({ data }) => setEmployees(data));
  }, []);

  const addEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (form.selectedEmails.includes(trimmed)) {
      toast.error('Already added');
      return;
    }
    setForm((f) => ({ ...f, selectedEmails: [...f.selectedEmails, trimmed], emailInput: '' }));
  };

  const removeEmail = (email) => {
    setForm((f) => ({ ...f, selectedEmails: f.selectedEmails.filter((e) => e !== email) }));
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(form.emailInput);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (form.selectedEmails.length === 0) return toast.error('Add at least one employee email');

    try {
      await api.post('/tasks', {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        emails: form.selectedEmails,
      });
      toast.success(`Task assigned to ${form.selectedEmails.length} employee(s)`);
      setCreateOpen(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', selectedEmails: [], emailInput: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Task updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete task');
    }
  };

  const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Tasks</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Assign and track work across your team</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Button variant="primary" icon={FiPlus} onClick={() => setCreateOpen(true)}>Assign Task</Button>
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiClipboard} title="No tasks found" />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900 dark:text-white">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-xs text-primary-400 line-clamp-1">{t.description}</p>}
                    <p className="mt-0.5 text-[11px] text-primary-300 dark:text-slate-500">by {t.createdBy?.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.assignedTo?.map((a) => (
                        <span key={a._id} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] text-primary-700 dark:bg-white/10 dark:text-slate-300">
                          {a.name}
                        </span>
                      ))}
                      {(!t.assignedTo || t.assignedTo.length === 0) && <span className="text-primary-300 dark:text-slate-500">Unassigned</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge></td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t._id, e.target.value)}
                      className="cursor-pointer rounded-lg border border-primary-100 bg-white/80 px-2.5 py-1.5 text-xs font-medium outline-none transition-colors hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-primary-500 dark:text-slate-400">
                    {t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteTask(t._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-white/10">
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Assign new task">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Task title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Inspect vehicle fleet" />
          
          <div>
            <label className="mb-1 block text-xs font-medium text-primary-600 dark:text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
            <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          {/* Email multi-select */}
          <div>
            <label className="mb-1 block text-xs font-medium text-primary-600 dark:text-slate-300">
              Assign to employees <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <FiMail className="text-primary-400" size={14} />
              <input
                value={form.emailInput}
                onChange={(e) => setForm({ ...form, emailInput: e.target.value })}
                onKeyDown={handleEmailKeyDown}
                onBlur={() => form.emailInput && addEmail(form.emailInput)}
                placeholder="Type email and press Enter..."
                className="flex-1 bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
            {form.selectedEmails.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.selectedEmails.map((email) => (
                  <span key={email} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700 dark:bg-white/10 dark:text-slate-300">
                    {email}
                    <button type="button" onClick={() => removeEmail(email)} className="text-primary-400 hover:text-red-500">
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-primary-400 dark:text-slate-500">
              {employees.length} employee(s) available. Type or paste emails above.
            </p>
            {/* Quick-pick from existing employees */}
            {employees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {employees
                  .filter((emp) => !form.selectedEmails.includes(emp.email))
                  .slice(0, 8)
                  .map((emp) => (
                    <button
                      key={emp._id}
                      type="button"
                      onClick={() => addEmail(emp.email)}
                      className="rounded-full border border-primary-100 px-2 py-0.5 text-[11px] text-primary-600 hover:bg-primary-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10"
                    >
                      + {emp.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" icon={FiCheckCircle}>
              Assign to {form.selectedEmails.length} employee{form.selectedEmails.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
