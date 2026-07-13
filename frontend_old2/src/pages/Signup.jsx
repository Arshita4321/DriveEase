import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await signup(form);
      toast.success(`Welcome to DriveEase, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands of renters booking smarter, faster."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-300">Log in</Link>
        </>
      }
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input label="Full name" icon={FiUser} required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
        <Input label="Email address" type="email" icon={FiMail} required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <Input label="Phone (optional)" icon={FiPhone} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        <Input label="Password" type="password" icon={FiLock} required value={form.password} onChange={set('password')} placeholder="At least 6 characters" />

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </motion.p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} iconRight={FiArrowRight} className="w-full justify-center">
          Create account
        </Button>
        <p className="text-center text-[11px] text-primary-400 dark:text-slate-500">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
      </motion.form>
    </AuthShell>
  );
}
