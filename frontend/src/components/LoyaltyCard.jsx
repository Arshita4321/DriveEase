import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowDownCircle, FiAward, FiGift, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import Button from './ui/Button';

const tierColors = {
  bronze: { bg: 'from-amber-600 to-orange-700',  label: 'Bronze' },
  silver: { bg: 'from-slate-400 to-slate-600',    label: 'Silver' },
  gold:   { bg: 'from-amber-400 to-yellow-600',   label: 'Gold'   },
};

export default function LoyaltyCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(100);

  const load = () => {
    setLoading(true);
    api.get('/users/loyalty').then(({ data }) => setData(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const redeem = async () => {
    setRedeeming(true);
    try {
      const { data } = await api.post('/users/loyalty/redeem', { points: redeemPoints });
      toast.success(`Redeemed! Promo code: ${data.code} (₹${data.discountValue} off)`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not redeem points');
    } finally { setRedeeming(false); }
  };

  if (loading || !data) return <p className="py-8 text-center text-sm text-primary-400">Loading…</p>;

  const tier = tierColors[data.tier] || tierColors.bronze;
  const progress = data.nextTier
    ? Math.min(100, Math.round((data.points / (data.points + data.pointsToNextTier)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Loyalty card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.bg} p-6 text-white shadow-lg`}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">Loyalty Tier</p>
              <h3 className="font-display text-2xl font-bold">{tier.label}</h3>
            </div>
            <FiAward className="text-4xl text-white/80" />
          </div>
          <div className="mt-5">
            <p className="text-4xl font-bold font-mono">{data.points.toLocaleString()}</p>
            <p className="text-xs text-white/70">reward points</p>
          </div>
          {data.nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70">
                <span>{tier.label}</span>
                <span>{data.nextTier}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-white/70">{data.pointsToNextTier} points to {data.nextTier}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface rounded-xl p-4 text-center">
          <FiTrendingUp className="mx-auto mb-1 text-primary-500" size={20} />
          <p className="font-mono text-lg font-bold text-primary-950 dark:text-white">{data.earnMultiplier}x</p>
          <p className="text-xs text-primary-400">Earn rate</p>
        </div>
        <div className="card-surface rounded-xl p-4 text-center">
          <FiGift className="mx-auto mb-1 text-primary-500" size={20} />
          <p className="font-mono text-lg font-bold text-primary-950 dark:text-white">₹{data.redeemValue || 0}</p>
          <p className="text-xs text-primary-400">Redeemable value</p>
        </div>
      </div>

      {/* Redeem */}
      {data.points >= 100 && (
        <div className="card-surface rounded-2xl p-5">
          <h4 className="flex items-center gap-2 font-display font-semibold text-primary-950 dark:text-white">
            <FiGift className="text-primary-500" /> Redeem points
          </h4>
          <p className="mt-1 text-xs text-primary-500 dark:text-slate-400">
            Redeem points for a promo code (100 pts = ₹{Math.round(100 * data.redeemRate)} off). Minimum 100 points.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              min="100"
              step="100"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(Math.max(100, Math.floor(Number(e.target.value) / 100) * 100))}
              className="w-28 rounded-xl border border-primary-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <Button variant="primary" size="sm" loading={redeeming} onClick={redeem}>Redeem ₹{Math.floor(redeemPoints / 100) * data.redeemRate * 100}</Button>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <h4 className="mb-3 font-display font-semibold text-primary-950 dark:text-white">Recent activity</h4>
        {data.transactions.length === 0 ? (
          <p className="text-sm text-primary-400">No transactions yet. Complete a booking to earn points!</p>
        ) : (
          <div className="space-y-2">
            {data.transactions.map((t) => (
              <div key={t._id} className="card-surface flex items-center justify-between rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === 'earned' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}>
                    {t.type === 'earned' ? <FiTrendingUp size={14} /> : <FiArrowDownCircle size={14} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary-900 dark:text-white">{t.description}</p>
                    <p className="text-xs text-primary-400">{format(new Date(t.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-bold ${t.type === 'earned' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {t.type === 'earned' ? '+' : ''}{t.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
