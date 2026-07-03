import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCamera, FiHeart, FiMail, FiPhone, FiSave, FiTrendingUp, FiUser } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import KYCSection from '../components/KYCSection';
import LoyaltyCard from '../components/LoyaltyCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import { VehicleCardSkeleton } from '../components/ui/Skeleton';
import StatCard from '../components/ui/StatCard';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, updateUserLocal } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const fileRef = useRef(null);

  const [form, setForm] = useState({ name: user?.name || '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setForm({ name: data.name, phone: data.phone || '' });
      setWishlist(data.wishlist || []);
      setLoadingWishlist(false);
    });
    api.get('/users/stats').then(({ data }) => setStats(data));
  }, []);

  const setTab = (t) => setParams({ tab: t });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUserLocal({ name: data.name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.put('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUserLocal({ avatar: data.avatar });
      toast.success('Avatar updated');
    } catch (err) {
      toast.error('Could not upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="container-px mx-auto max-w-5xl py-10">
      <h1 className="font-display text-3xl font-bold text-primary-950 dark:text-white">Your account</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">Manage your details, track spending, and revisit saved vehicles.</p>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={FiTrendingUp} label="Total bookings" value={stats.totalBookings} tone="primary" />
          <StatCard icon={FiTrendingUp} label="Completed trips" value={stats.completedTrips} tone="cyan" />
          <StatCard icon={FiTrendingUp} label="Cancelled" value={stats.cancelledBookings} tone="orange" />
          <StatCard icon={FiTrendingUp} label="Total spent" value={stats.totalSpent} prefix="₹" tone="emerald" />
        </div>
      )}

      <div className="mt-8 flex gap-2 border-b border-primary-100 dark:border-white/10">
        {[
          { id: 'profile',  label: 'Profile' },
          { id: 'kyc',      label: 'KYC' },
          { id: 'loyalty',  label: 'Rewards' },
          { id: 'wishlist', label: `Wishlist (${wishlist.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-primary-700 dark:text-white' : 'text-primary-400 hover:text-primary-600 dark:text-slate-500'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span layoutId="profile-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-grad-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center">
            <div className="relative">
              <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-grad-primary text-3xl font-bold text-white shadow-glow">
                {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="btn-focus-ring absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-600 shadow-md dark:bg-primary-900 dark:text-primary-300"
              >
                <FiCamera size={15} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
            </div>
            <p className="mt-3 text-center font-display font-semibold text-primary-950 dark:text-white">{user?.name}</p>
            <p className="text-center text-xs text-primary-400 dark:text-slate-500">{user?.email}</p>
          </div>

          <form onSubmit={saveProfile} className="card-surface space-y-4 rounded-2xl p-6">
            <Input label="Full name" icon={FiUser} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" icon={FiMail} value={user?.email || ''} disabled className="opacity-70" />
            <Input label="Phone" icon={FiPhone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            <Button type="submit" variant="primary" icon={FiSave} loading={saving}>Save changes</Button>
          </form>
        </div>
      ) : tab === 'kyc' ? (
        <div className="mt-8 max-w-2xl">
          <KYCSection />
        </div>
      ) : tab === 'loyalty' ? (
        <div className="mt-8 max-w-2xl">
          <LoyaltyCard />
        </div>
      ) : (
        <div className="mt-8">
          {loadingWishlist ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : wishlist.length === 0 ? (
            <EmptyState icon={FiHeart} title="Your wishlist is empty" description="Tap the heart on any vehicle to save it here." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((v, i) => <VehicleCard key={v._id} vehicle={v} index={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
