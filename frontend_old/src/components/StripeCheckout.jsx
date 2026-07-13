import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base:    { fontSize: '15px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } },
    invalid: { color: '#dc2626' },
  },
};

// Inner form — needs to be inside <Elements>
function CheckoutForm({ bookingId, totalPrice, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [ready,   setReady]   = useState(false);

  // Create payment intent on mount
  const [clientSecret, setClientSecret] = useState('');
  useEffect(() => {
    api.post('/payments/create-intent', { bookingId })
      .then(({ data }) => { setClientSecret(data.clientSecret); setReady(true); })
      .catch(() => setError('Could not initialise payment. Try again.'));
  }, [bookingId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setError('');
    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (stripeErr) {
      setError(stripeErr.message);
      setLoading(false);
      return;
    }
    if (paymentIntent.status === 'succeeded') {
      await api.post('/payments/confirm', { bookingId });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="stripe-form">
      <p>Total to pay: <strong>${totalPrice}</strong></p>
      <div className="card-element-box">
        {ready ? <CardElement options={CARD_STYLE} /> : <p>Loading payment form…</p>}
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading || !ready}>
        {loading ? 'Processing…' : `Pay $${totalPrice}`}
      </button>
    </form>
  );
}

// Exported wrapper with Elements provider
export default function StripeCheckout({ bookingId, totalPrice, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm bookingId={bookingId} totalPrice={totalPrice} onSuccess={onSuccess} />
    </Elements>
  );
}
