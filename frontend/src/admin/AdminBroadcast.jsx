import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiSend, FiUsers } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../services/api';

export default function AdminBroadcast() {
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'all' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error('Title and message are required');
    }
    setSending(true);
    try {
      const { data } = await api.post('/admin/broadcast', {
        title: form.title,
        message: form.message,
        targetRole: form.targetRole,
      });
      toast.success(data.message);
      setForm({ title: '', message: '', targetRole: 'all' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send broadcast');
    } finally {
      setSending(false);
    }
  };

  const roleLabel = { all: 'All users', user: 'Customers only', employee: 'Employees only', admin: 'Admins only' };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Broadcast</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Send a notification to all users on the platform</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="card-surface rounded-2xl p-6 lg:col-span-2">
          <form onSubmit={handleSend} className="space-y-5">
            <Input
              label="Notification title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Scheduled maintenance this weekend"
              icon={FiBell}
            />

            <div>
              <label className="mb-1 block text-xs font-medium text-primary-600 dark:text-slate-300">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                required
                className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Write your announcement or notice here..."
              />
            </div>

            <Select
              label="Send to"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            >
              <option value="all">All users</option>
              <option value="user">Customers only</option>
              <option value="employee">Employees only</option>
              <option value="admin">Admins only</option>
            </Select>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="lg" loading={sending} iconRight={FiSend}>
                Send Notification
              </Button>
            </div>
          </form>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="card-surface rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-primary text-white">
                <FiUsers size={18} />
              </div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-white">Audience</p>
                <p className="text-xs text-primary-400">{roleLabel[form.targetRole]}</p>
              </div>
            </div>
          </div>

          <div className="card-surface rounded-2xl p-5">
            <h3 className="font-medium text-primary-900 dark:text-white">Tips</h3>
            <ul className="mt-2 space-y-2 text-xs text-primary-500 dark:text-slate-400">
              <li>Use broadcasts for platform-wide announcements</li>
              <li>Target specific roles for role-specific updates</li>
              <li>Notifications appear in the bell icon for all recipients</li>
              <li>Keep messages clear and concise</li>
            </ul>
          </div>

          <div className="card-surface rounded-2xl p-5">
            <h3 className="font-medium text-primary-900 dark:text-white">Preview</h3>
            <div className="mt-3 rounded-xl border border-primary-100 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-primary-900 dark:text-white">{form.title || 'Notification title'}</p>
              <p className="mt-1 text-xs text-primary-500 dark:text-slate-400">
                {form.message || 'Your message will appear here...'}
              </p>
              <p className="mt-2 text-[10px] text-primary-300 dark:text-slate-600">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
