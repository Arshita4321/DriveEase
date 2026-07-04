import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiBellOff, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function WishlistButton({ vehicleId, className = '' }) {
  const { user, isWishlisted, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const active = isWishlisted(vehicleId);

  const [alertActive, setAlertActive] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  useEffect(() => {
    if (!user || !active) {
      setAlertActive(false);
      return;
    }
    let cancelled = false;
    api.get('/price-alerts')
      .then(({ data }) => {
        if (cancelled) return;
        const alert = data.alerts?.find((a) => a.vehicle?._id === vehicleId || a.vehicle === vehicleId);
        setAlertActive(alert?.active || false);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, active, vehicleId]);

  const requireAuth = (action) => {
    if (!user) {
      toast(`Log in to ${action}`);
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth('save vehicles')) return;
    await toggleWishlist(vehicleId);
    toast.success(active ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAlert = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth('set price alerts')) return;
    if (!active) {
      toast('Add to wishlist first to enable price alerts');
      return;
    }
    setLoadingAlert(true);
    try {
      const { data } = await api.post(`/price-alerts/${vehicleId}`);
      setAlertActive(data.active);
      toast.success(data.active ? 'Price alert enabled' : 'Price alert disabled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update alert');
    } finally {
      setLoadingAlert(false);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleWishlist}
        aria-label="Toggle wishlist"
        className="flex h-9 w-9 items-center justify-center rounded-full glass shadow-sm transition-colors"
      >
        <FiHeart
          size={16}
          className={active ? 'fill-red-500 text-red-500' : 'text-primary-500 dark:text-slate-300'}
        />
      </motion.button>

      {active && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleAlert}
          disabled={loadingAlert}
          aria-label="Toggle price alert"
          title={alertActive ? 'Price alert on' : 'Notify when price drops'}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${
            alertActive
              ? 'bg-accent-orange text-white'
              : 'glass text-primary-500 dark:text-slate-300'
          }`}
        >
          {alertActive ? <FiBell size={14} className="fill-current" /> : <FiBellOff size={14} />}
        </motion.button>
      )}
    </div>
  );
}

