import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiCalendar, FiDroplet, FiMapPin, FiTrendingUp, FiZap } from 'react-icons/fi';
import api from '../services/api';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';

const fuelLabels = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  electric: 'Electric',
  hybrid: 'Hybrid',
};

export default function TripEstimator({ vehicle }) {
  const [distance, setDistance] = useState('');
  const [days, setDays] = useState('1');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEstimate(null);
    setError('');
  }, [vehicle._id]);

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!distance || Number(distance) <= 0) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/vehicles/${vehicle._id}/estimate-cost`, {
        distanceKm: Number(distance),
        days: Number(days) || 1,
      });
      setEstimate(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not estimate cost');
    } finally {
      setLoading(false);
    }
  };

  const FuelIcon = vehicle.fuelType === 'electric' ? FiZap : FiDroplet;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
          <FiTrendingUp size={16} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-primary-950 dark:text-white">Trip Cost Estimator</h3>
          <p className="text-xs text-primary-500 dark:text-slate-400">Estimate fuel + rental cost before booking</p>
        </div>
      </div>

      <form onSubmit={handleEstimate} className="mt-4 grid grid-cols-2 gap-3">
        <Input
          label="Trip distance (km)"
          type="number"
          min="1"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="e.g. 250"
          icon={FiMapPin}
        />
        <Input
          label="Rental days"
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="1"
          icon={FiCalendar}
        />
        <div className="col-span-2">
          <Button type="submit" variant="primary" size="md" loading={loading} className="w-full justify-center">
            Estimate cost
          </Button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}

        {estimate && (
          <motion.div
            key="result"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 border-t border-primary-100 pt-4 dark:border-white/10"
          >
            <div className="grid grid-cols-2 gap-3">
              <CostItem
                icon={FuelIcon}
                label={`${fuelLabels[estimate.fuelType] || 'Fuel'} cost`}
                value={`₹${estimate.fuelCost.toLocaleString()}`}
                sub={`${estimate.efficiency} ${vehicle.fuelType === 'electric' ? 'km/kWh' : 'km/l'} · ₹${estimate.unitPrice}/${vehicle.fuelType === 'electric' ? 'kWh' : 'l'}`}
                delay={0}
              />
              <CostItem
                icon={FiCalendar}
                label="Rental cost"
                value={`₹${estimate.rentalCost.toLocaleString()}`}
                sub={`₹${vehicle.pricePerDay}/day · ${estimate.days} day${estimate.days > 1 ? 's' : ''}`}
                delay={0.05}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-grad-primary p-3 text-center text-white shadow-glow"
            >
              <p className="text-xs font-medium opacity-90">Estimated total</p>
              <p className="font-display text-2xl font-bold">₹{estimate.totalEstimate.toLocaleString()}</p>
              <p className="text-[11px] opacity-80">for {estimate.distanceKm} km</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function CostItem({ icon: Icon, label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-primary-50 p-3 dark:bg-white/5"
    >
      <div className="flex items-center gap-1.5 text-primary-500 dark:text-slate-400">
        <Icon size={13} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 font-display text-lg font-bold text-primary-950 dark:text-white">{value}</p>
      <p className="text-[10px] text-primary-400 dark:text-slate-500">{sub}</p>
    </motion.div>
  );
}
