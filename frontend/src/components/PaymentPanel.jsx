import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiCheck,
    FiChevronRight,
    FiCreditCard,
    FiLoader,
    FiLock, FiShield,
    FiSmartphone,
    FiWifi,
} from 'react-icons/fi';
import { SiRazorpay, SiVisa } from 'react-icons/si';
import api from '../services/api';
import ConfettiCelebration from './ui/ConfettiCelebration';

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

/** Live-updating credit card visual — purely cosmetic, never submitted anywhere. */
function CardPreview({ number, name, expiry, flipped }) {
  const groups = (number || '').padEnd(16, '•').match(/.{1,4}/g);
  return (
    <div className="[perspective:1200px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-44 w-full [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-5 text-white shadow-lg [backface-visibility:hidden]">
          <div className="flex items-start justify-between">
            <span className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 opacity-90" />
            <FiWifi className="rotate-90 opacity-70" size={20} />
          </div>
          <p className="mt-5 font-mono text-lg tracking-widest">{groups.join('  ')}</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-white/60">Card holder</p>
              <p className="text-sm font-medium uppercase">{name || 'YOUR NAME'}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-white/60">Expires</p>
              <p className="text-sm font-medium">{expiry || 'MM/YY'}</p>
            </div>
            <SiVisa size={30} className="opacity-90" />
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-800 to-primary-950 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-5 h-9 w-full bg-black/60" />
          <div className="mt-5 px-5">
            <div className="flex h-8 items-center justify-end rounded bg-white/90 px-3">
              <span className="font-mono text-xs italic text-primary-950">•••</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentPanel({ booking, discount, onPaid }) {
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvcFocused, setCvcFocused] = useState(false);

  const subtotal = booking.totalPrice;
  const discountAmount = discount?.discount || 0;
  // NOTE: the backend order is created for booking.totalPrice — a promo
  // discount only reduces the *displayed* total here unless the booking
  // record itself is updated server-side to store the discounted price.
  const payable = Math.max(subtotal - discountAmount, 0);

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
            setPaid(true);
            toast.success('Payment successful! Booking confirmed.');
            setTimeout(() => onPaid?.(data.booking), 1400);
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

  if (paid) {
    return (
      <>
        <ConfettiCelebration trigger={paid} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface flex flex-col items-center rounded-2xl p-8 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"
          >
            <FiCheck size={30} />
          </motion.span>
          <h3 className="mt-4 font-display text-lg font-semibold text-primary-950 dark:text-white">
            Payment successful
          </h3>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">
            Your booking is confirmed. Redirecting to your bookings…
          </p>
        </motion.div>
      </>
    );
  }

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

      <AnimatePresence mode="wait">
        {method === 'card' ? (
          <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <CardPreview number={cardNumber} name={cardName} expiry={expiry} flipped={cvcFocused} />

            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Cardholder name"
              className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="Card number"
              inputMode="numeric"
              className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
                placeholder="MM/YY"
                className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <input
                onFocus={() => setCvcFocused(true)}
                onBlur={() => setCvcFocused(false)}
                placeholder="CVC"
                maxLength={3}
                inputMode="numeric"
                className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <p className="text-[11px] text-primary-400 dark:text-slate-500">
              This preview is illustrative — the real checkout opens Razorpay's own secure modal.
            </p>
          </motion.div>
        ) : (
          <motion.div key="upi" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl border border-primary-100 bg-white/80 px-4 py-3 text-sm text-primary-400 dark:border-white/10 dark:bg-white/5">
              yourname@upi
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order summary */}
      <div className="mt-5 space-y-1.5 rounded-xl bg-primary-50 px-4 py-3 text-sm dark:bg-white/5">
        <div className="flex justify-between text-primary-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono">₹{subtotal}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Promo discount</span>
            <span className="font-mono">−₹{discountAmount}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-primary-100 pt-1.5 font-semibold text-primary-950 dark:border-white/10 dark:text-white">
          <span>Amount payable</span>
          <span className="font-mono">₹{payable}</span>
        </div>
      </div>

      <button
        onClick={pay}
        disabled={paying}
        className="btn-focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-grad-primary py-3 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50"
      >
        {paying ? <FiLoader className="animate-spin" /> : <FiShield />}
        {paying ? 'Processing…' : `Pay ₹${subtotal} securely`}
        {!paying && <FiChevronRight />}
      </button>

      <div className="mt-4 flex items-center justify-center gap-4 text-primary-300 dark:text-slate-600">
        <span className="flex items-center gap-1 text-[11px]"><FiLock size={11} /> 256-bit SSL</span>
        <span className="flex items-center gap-1 text-[11px]"><FiShield size={11} /> PCI DSS compliant</span>
        <SiRazorpay size={14} />
      </div>
      <p className="mt-2 text-center text-[11px] text-primary-400 dark:text-slate-500">
        Processed via Razorpay. Card fields above are illustrative — the actual transaction happens inside Razorpay's secure checkout.
      </p>
    </div>
  );
}
