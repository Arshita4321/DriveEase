import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [message,   setMessage]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMessage('Passwords do not match');
    setLoading(true);
    setMessage('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-card">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input type="password" placeholder="New password (min 6 chars)" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm new password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
