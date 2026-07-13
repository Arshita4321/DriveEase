import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiSettings, FiDroplet, FiMapPin, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiArrowLeft, FiPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import Rating from '../components/ui/Rating';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WishlistButton from '../components/WishlistButton';
import BookingCalendar from '../components/BookingCalendar';
import PaymentPanel from '../components/PaymentPanel';
import PromoInput from '../components/PromoInput';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/vehicles/${id}`),
      api.get(`/reviews/vehicle/${id}`),
    ])
      .then(([v, r]) => {
        setVehicle(v.data);
        setReviews(r.data || []);
      })
      .catch(() => toast.error('Vehicle not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const images = vehicle?.images?.length ? vehicle.images : [PLACEHOLDER];

  const handleConfirmBooking = async ({ startDate, endDate }) => {
    if (!user) {
      toast('Log in to book a vehicle');
      navigate('/login', { state: { from: `/vehicles/${id}` } });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        vehicleId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setPendingBooking(data);
      toast.success('Booking created — complete payment to confirm');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/reviews', { vehicleId: id, ...reviewForm });
      setReviews((r) => [{ ...data, user: { name: user.name } }, ...r]);
      toast.success('Review submitted — thank you!');
      setReviewOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  if (loading) {
    return (
      <div className="container-px mx-auto max-w-7xl py-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <EmptyState title="Vehicle not found" description="It may have been removed." action={<Button as={Link} to="/vehicles">Back to listings</Button>} />
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-700 dark:text-slate-400">
        <FiArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {/* Gallery */}
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={images[activeImg]}
                alt={vehicle.name}
                className="h-[420px] w-full object-cover"
              />
            </AnimatePresence>
            <WishlistButton vehicleId={vehicle._id} className="absolute right-4 top-4" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
                >
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImg === i ? 'border-primary-500' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title & specs */}
          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="primary">{vehicle.type}</Badge>
                  {vehicle.isAvailable ? <Badge tone="success">Available</Badge> : <Badge tone="danger">Currently booked</Badge>}
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold text-primary-950 dark:text-white">{vehicle.name}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-500 dark:text-slate-400">
                  <FiMapPin size={14} /> {vehicle.location}
                </p>
              </div>
              <Rating value={vehicle.averageRating} count={vehicle.numReviews} size={16} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec icon={FiUsers} label="Seats" value={vehicle.seats} />
              <Spec icon={FiSettings} label="Transmission" value={vehicle.transmission} />
              <Spec icon={FiDroplet} label="Fuel" value={vehicle.fuelType} />
              <Spec icon={FiCheckCircle} label="Year" value={vehicle.year || '—'} />
            </div>

            {vehicle.description && (
              <div className="mt-6">
                <h3 className="font-display font-semibold text-primary-950 dark:text-white">About this vehicle</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-600 dark:text-slate-300">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-primary-950 dark:text-white">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              {user && (
                <Button variant="ghost" size="sm" icon={FiPlus} onClick={() => setReviewOpen(true)}>Write a review</Button>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-primary-400 dark:text-slate-500">No reviews yet — be the first to rent and review this vehicle.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <Card key={r._id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-grad-primary text-xs font-bold text-white">
                          {r.user?.name?.[0]?.toUpperCase() || '?'}
                        </span>
                        <span className="text-sm font-medium text-primary-900 dark:text-white">{r.user?.name || 'Renter'}</span>
                      </div>
                      <Rating value={r.rating} showValue={false} size={13} />
                    </div>
                    {r.comment && <p className="mt-2.5 text-sm text-primary-600 dark:text-slate-300">{r.comment}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking column */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {pendingBooking && pendingBooking.paymentStatus !== 'paid' ? (
            <>
              <PromoInput orderTotal={pendingBooking.totalPrice} />
              <PaymentPanel
                booking={pendingBooking}
                onPaid={(b) => {
                  setPendingBooking(b);
                  navigate('/my-bookings');
                }}
              />
            </>
          ) : (
            <BookingCalendar vehicle={vehicle} onConfirm={handleConfirmBooking} submitting={submitting} />
          )}
        </div>
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a review">
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-primary-900 dark:text-slate-200">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                  className={`text-2xl ${n <= reviewForm.rating ? 'text-amber-400' : 'text-primary-200 dark:text-white/15'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="Share details of your experience…"
            rows={4}
            className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <Button type="submit" variant="primary" className="w-full justify-center">Submit review</Button>
        </form>
      </Modal>
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="card-surface rounded-xl p-3 text-center">
      <Icon className="mx-auto mb-1 text-primary-500" size={17} />
      <p className="text-sm font-semibold capitalize text-primary-950 dark:text-white">{value}</p>
      <p className="text-[11px] text-primary-400 dark:text-slate-500">{label}</p>
    </div>
  );
}
