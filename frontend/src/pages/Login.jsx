import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/layout/AuthShell';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirect = location.state?.from || (user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/employee' : '/');
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setForm({ email: 'admin@driveease.com', password: 'Admin@123' });
    setError('');
    setLoading(true);
    try {
      const user = await login('admin@driveease.com', 'Admin@123');
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your bookings and continue where you left off."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-300">Sign up</Link>
        </>
      }
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Email address"
          type="email"
          icon={FiMail}
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            icon={FiLock}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3.5 top-[38px] text-primary-400"
            tabIndex={-1}
          >
            {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-primary-500 hover:text-primary-700 dark:text-slate-400">
            Forgot password?
          </Link>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </motion.p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} iconRight={FiArrowRight} className="w-full justify-center">
          Log in
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-primary-100 dark:border-white/10" />
          <span className="mx-3 text-xs text-primary-400 dark:text-slate-500">or</span>
          <div className="flex-grow border-t border-primary-100 dark:border-white/10" />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={loginAsAdmin}
          loading={loading}
          className="w-full justify-center"
        >
          Log in as Admin
        </Button>
      </motion.form>
    </AuthShell>
  );
}
