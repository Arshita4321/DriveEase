import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthShell from '../components/layout/AuthShell';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link may have expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-300">Back to log in</Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="New password" type="password" icon={FiLock} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        <Input label="Confirm password" type="password" icon={FiLock} required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
        <Button type="submit" variant="primary" size="lg" loading={loading} iconRight={FiArrowRight} className="w-full justify-center">
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
