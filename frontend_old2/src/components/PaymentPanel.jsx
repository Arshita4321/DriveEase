import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiLock, FiShield, FiLoader } from 'react-icons/fi';
import { SiRazorpay } from 'react-icons/si';
import toast from 'react-hot-toast';
import api from '../services/api';

const methods = [
  { id: 'card', label: 'Card', icon: FiCreditCard },
  { id: 'upi', label: 'UPI', icon: FiSmartphone },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPanel({ booking, onPaid }) {
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    setPaying(true);
    try {
      const { data: order } = await api.post('/payments/create-order', { bookingId: booking._id });
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        toast.error('Could not load payment gateway. Check your connection.');
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DriveEase',
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: '#4338CA' },
        handler: async (response) => {
          try {
            const { data } = await api.post('/payments/verify', {
              ...response,
              bookingId: booking._id,
            });
            toast.success('Payment successful! Booking confirmed.');
            onPaid?.(data.booking);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      if (err.response?.status === 503) {
        toast.error('Payments are not configured on this server yet.');
      } else {
        toast.error(err.response?.data?.message || 'Could not start payment');
      }
      setPaying(false);
    }
  };

  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display font-semibold text-primary-950 dark:text-white">
          <FiLock className="text-primary-500" /> Secure payment
        </h3>
        <SiRazorpay className="text-[#3395FF]" size={20} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
              method === m.id
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                : 'border-primary-100 text-primary-500 hover:bg-primary-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
          >
            <m.icon size={15} /> {m.label}
          </button>
        ))}
      </div>

      {method === 'card' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-primary-400 dark:border-white/10 dark:bg-white/5">
            Card number • •••• •••• •••• 4242
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-primary-400 dark:border-white/10 dark:bg-white/5">
              MM / YY
            </div>
            <div className="rounded-xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-primary-400 dark:border-white/10 dark:bg-white/5">
              CVC
            </div>
          </div>
        </motion.div>
      )}
      {method === 'upi' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-primary-400 dark:border-white/10 dark:bg-white/5">
            yourname@upi
          </div>
        </motion.div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm dark:bg-white/5">
        <span className="text-primary-500 dark:text-slate-400">Amount payable</span>
        <span className="font-mono font-bold text-primary-900 dark:text-white">₹{booking.totalPrice}</span>
      </div>

      <button
        onClick={pay}
        disabled={paying}
        className="btn-focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-grad-primary py-3 text-sm font-semibold text-white shadow-glow hover:brightness-110 disabled:opacity-50"
      >
        {paying ? <FiLoader className="animate-spin" /> : <FiShield />}
        {paying ? 'Processing…' : `Pay ₹${booking.totalPrice} securely`}
      </button>
      <p className="mt-2 text-center text-[11px] text-primary-400 dark:text-slate-500">
        Payments are encrypted and processed via Razorpay. Card details shown are illustrative only.
      </p>
    </div>
  );
}
