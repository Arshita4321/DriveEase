import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-300">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <FiCheckCircle className="mb-2" size={20} />
          If that email exists, a reset link has been sent. Check your inbox.
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email address" type="email" icon={FiMail} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={loading} iconRight={FiArrowRight} className="w-full justify-center">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
