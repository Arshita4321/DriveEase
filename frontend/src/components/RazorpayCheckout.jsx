import React, { useState } from 'react';
import api from '../services/api';

// Razorpay loads from their CDN — no npm package needed.
// The checkout modal is opened via window.Razorpay(), which the CDN script provides.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true); // already loaded
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

export default function RazorpayCheckout({ bookingId, totalPrice, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);

    // 1. Load Razorpay SDK from CDN
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load Razorpay. Check your internet connection.');
      setLoading(false);
      return;
    }

    // 2. Ask backend to create a Razorpay order
    let orderData;
    try {
      const { data } = await api.post('/payments/create-order', { bookingId });
      orderData = data;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create payment order.');
      setLoading(false);
      return;
    }

    // 3. Open the Razorpay checkout modal
    const options = {
      key:         orderData.keyId,           // rzp_test_xxx
      amount:      orderData.amount,          // in paise
      currency:    orderData.currency,        // 'INR'
      name:        'DriveEase',
      description: orderData.description,
      order_id:    orderData.orderId,
      prefill:     orderData.prefill,
      theme:       { color: '#4f46e5' },      // matches DriveEase brand colour

      // ── Handlers ───────────────────────────────────────────────────────────
      handler: async (response) => {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        try {
          await api.post('/payments/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            bookingId,
          });
          onSuccess();
        } catch (err) {
          setError(err.response?.data?.message || 'Payment verification failed. Contact support.');
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setError('Payment cancelled. You can try again.');
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failures inside the modal (e.g. card declined)
    rzp.on('payment.failed', (response) => {
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });

    rzp.open();
  };

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="razorpay-checkout">
      <div className="payment-summary-box">
        <h4>Order Summary</h4>
        <div className="payment-row">
          <span>Rental total</span>
          <strong>₹{totalPrice}</strong>
        </div>
        <div className="payment-row total-row">
          <span>Amount to pay</span>
          <strong>₹{totalPrice}</strong>
        </div>
      </div>

      <div className="payment-methods-info">
        <p>Accepted payment methods via Razorpay:</p>
        <div className="payment-badges">
          <span className="badge">💳 Credit / Debit Card</span>
          <span className="badge">📱 UPI</span>
          <span className="badge">🏦 Net Banking</span>
          <span className="badge">👛 Wallets</span>
          <span className="badge">💰 EMI</span>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        className="btn-primary pay-btn"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? 'Opening payment…' : `Pay ₹${totalPrice} via Razorpay`}
      </button>

      <p className="secure-note">🔒 Secured by Razorpay · PCI DSS compliant</p>
    </div>
  );
}
