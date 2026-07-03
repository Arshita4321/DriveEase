import { addDays, differenceInCalendarDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar, FiCheckCircle, FiLoader, FiXCircle } from 'react-icons/fi';
import api from '../services/api';
import AddonSelector from './AddonSelector';

export default function BookingCalendar({ vehicle, onConfirm, submitting }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [pricing, setPricing] = useState(null);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, differenceInCalendarDays(endDate, startDate));
  }, [startDate, endDate]);

  const totalPrice = pricing?.totalPrice ?? (totalDays * (vehicle?.pricePerDay || 0));

  // Fetch dynamic pricing preview when dates or addons change
  const fetchPricing = useCallback(() => {
    if (!startDate || !endDate) { setPricing(null); return; }
    const addonParam = selectedAddonIds.length > 0 ? `&addonIds=${selectedAddonIds.join(',')}` : '';
    api.get(`/vehicles/${vehicle._id}/pricing?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}${addonParam}`)
      .then(({ data }) => setPricing(data))
      .catch(() => setPricing(null));
  }, [startDate, endDate, selectedAddonIds, vehicle._id]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    api
      .get(`/vehicles/${vehicle._id}/availability`, {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      })
      .then(({ data }) => !cancelled && setAvailable(data.available))
      .catch(() => !cancelled && setAvailable(null))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, vehicle._id]);

  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display font-semibold text-primary-950 dark:text-white">
          <FiCalendar className="text-primary-500" /> Select rental dates
        </h3>
        <span className="font-mono text-lg font-bold text-primary-700 dark:text-primary-300">
          ₹{vehicle.pricePerDay}<span className="text-xs font-normal text-primary-400">/day</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-primary-500 dark:text-slate-400">Pick-up</label>
          <DatePicker
            selected={startDate}
            onChange={(d) => {
              setStartDate(d);
              if (endDate && d && endDate <= d) setEndDate(addDays(d, 1));
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            placeholderText="Start date"
            className="w-full rounded-xl border border-primary-100 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-primary-500 dark:text-slate-400">Drop-off</label>
          <DatePicker
            selected={endDate}
            onChange={(d) => setEndDate(d)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 1)}
            placeholderText="End date"
            className="w-full rounded-xl border border-primary-100 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {startDate && endDate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
          <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm dark:bg-white/5">
            {checking ? (
              <>
                <FiLoader className="animate-spin text-primary-400" /> Checking availability…
              </>
            ) : available ? (
              <>
                <FiCheckCircle className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Available for these dates</span>
              </>
            ) : (
              <>
                <FiXCircle className="text-red-500" />
                <span className="font-medium text-red-500">Not available — try different dates</span>
              </>
            )}
          </div>

          <AddonSelector vehicleType={vehicle.type} selectedIds={selectedAddonIds} onChange={setSelectedAddonIds} totalDays={totalDays} />

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-primary-500 dark:text-slate-400">
              <span>{totalDays} day{totalDays > 1 ? 's' : ''} × ₹{vehicle.pricePerDay}</span>
              <span className="font-mono">₹{pricing?.basePrice ?? totalPrice}</span>
            </div>
            {pricing?.weekendSurcharge > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Weekend surcharge</span>
                <span className="font-mono">+₹{pricing.weekendSurcharge}</span>
              </div>
            )}
            {pricing?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Long-term discount ({pricing.discountPercent}%)</span>
                <span className="font-mono">−₹{pricing.discountAmount}</span>
              </div>
            )}
            {pricing?.addonTotal > 0 && (
              <div className="flex justify-between text-primary-500 dark:text-slate-400">
                <span>Add-ons</span>
                <span className="font-mono">+₹{pricing.addonTotal}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-primary-100 pt-2 font-semibold text-primary-950 dark:border-white/10 dark:text-white">
              <span>Total</span>
              <span className="font-mono">₹{totalPrice}</span>
            </div>
          </div>
        </motion.div>
      )}

      <button
        disabled={!startDate || !endDate || !available || checking || submitting}
        onClick={() => onConfirm({ startDate, endDate, totalDays, totalPrice, addonIds: selectedAddonIds })}
        className="btn-focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-grad-primary py-3 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? <FiLoader className="animate-spin" /> : null}
        {submitting ? 'Booking…' : 'Reserve now'}
      </button>
      <p className="mt-2 text-center text-xs text-primary-400 dark:text-slate-500">You won't be charged yet</p>
    </div>
  );
}
