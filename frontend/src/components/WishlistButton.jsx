import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WishlistButton({ vehicleId, className = '' }) {
  const { user, isWishlisted, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const active = isWishlisted(vehicleId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Log in to save vehicles to your wishlist');
      navigate('/login');
      return;
    }
    await toggleWishlist(vehicleId);
    toast.success(active ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      aria-label="Toggle wishlist"
      className={`flex h-9 w-9 items-center justify-center rounded-full glass shadow-sm transition-colors ${className}`}
    >
      <FiHeart
        size={16}
        className={active ? 'fill-red-500 text-red-500' : 'text-primary-500 dark:text-slate-300'}
      />
    </motion.button>
  );
}
