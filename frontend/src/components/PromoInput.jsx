import React, { useState } from 'react';
import { FiTag, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function PromoInput({ orderTotal, onApplied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { discount, finalTotal, promo } | { error }

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/promos/validate', { code, orderTotal });
      setResult(data);
      onApplied?.(data);
    } catch (err) {
      setResult({ error: err.response?.data?.message || 'Invalid promo code' });
      onApplied?.(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiTag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Promo code"
            className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm uppercase outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <button
          onClick={validate}
          disabled={loading || !code.trim()}
          className="btn-focus-ring rounded-xl bg-primary-100 px-4 text-sm font-semibold text-primary-700 hover:bg-primary-200 disabled:opacity-50 dark:bg-white/10 dark:text-primary-200 dark:hover:bg-white/15"
        >
          {loading ? <FiLoader className="animate-spin" /> : 'Apply'}
        </button>
      </div>
      {result?.error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
          <FiX size={13} /> {result.error}
        </p>
      )}
      {result?.valid && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
          <FiCheck size={13} /> {result.promo.code} applied — you saved ₹{result.discount}
        </p>
      )}
    </div>
  );
}
