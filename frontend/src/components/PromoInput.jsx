import React, { useState } from 'react';
import api from '../services/api';

export default function PromoInput({ orderTotal, onApply }) {
  const [code,    setCode]    = useState('');
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    if (!code.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/promos/validate', { code, orderTotal });
      setResult(data);
      onApply(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCode('');
    setResult(null);
    setError('');
    onApply(null);
  };

  return (
    <div className="promo-input">
      <h4>Have a promo code?</h4>
      {result ? (
        <div className="promo-applied">
          <span>🎉 <strong>{result.promo.code}</strong> applied! You save ${result.discount}</span>
          <button onClick={clear}>Remove</button>
        </div>
      ) : (
        <div className="promo-row">
          <input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && validate()}
          />
          <button onClick={validate} disabled={loading || !code.trim()}>
            {loading ? '…' : 'Apply'}
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
