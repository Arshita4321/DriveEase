import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth }          from '../context/AuthContext.jsx';
import BookingCalendar      from '../components/BookingCalendar.jsx';
import WishlistButton       from '../components/WishlistButton.jsx';
import PromoInput           from '../components/PromoInput.jsx';
import RazorpayCheckout     from '../components/RazorpayCheckout.jsx';

export default function VehicleDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle,     setVehicle]    = useState(null);
  const [reviews,     setReviews]    = useState([]);
  const [calDates,    setCalDates]   = useState({ startDate: null, endDate: null, available: null });
  const [promoData,   setPromoData]  = useState(null);
  const [booking,     setBooking]    = useState(null);   // booking doc after POST /bookings
  const [step,        setStep]       = useState('select'); // select | payment | done
  const [message,     setMessage]    = useState('');
  const [imgIdx,      setImgIdx]     = useState(0);
  const [reviewForm,  setReviewForm] = useState({ rating: 5, comment: '' });

  const load = async () => {
    const [v, r] = await Promise.all([
      api.get(`/vehicles/${id}`),
      api.get(`/reviews/vehicle/${id}`),
    ]);
    setVehicle(v.data);
    setReviews(r.data);
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  // ── Price calculations ────────────────────────────────────────────────────
  const totalDays  = calDates.startDate && calDates.endDate
    ? Math.max(1, Math.ceil((calDates.endDate - calDates.startDate) / 86_400_000))
    : 0;
  const basePrice  = totalDays * (vehicle?.pricePerDay || 0);
  const discount   = promoData?.discount || 0;
  const finalPrice = parseFloat((basePrice - discount).toFixed(2));

  // ── Step 1: create booking ────────────────────────────────────────────────
  const confirmBooking = async () => {
    if (!user)               return navigate('/login');
    if (!calDates.available) return setMessage('Please select available dates first.');
    setMessage('');
    try {
      const { data } = await api.post('/bookings', {
        vehicleId: id,
        startDate: calDates.startDate,
        endDate:   calDates.endDate,
      });
      setBooking(data);

      // apply promo usage if a code was entered
      if (promoData?.promo?.id)
        await api.post('/promos/apply', { promoId: promoData.promo.id });

      setStep('payment');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not create booking. Please try again.');
    }
  };

  // ── Step 2 → 3: Razorpay success callback ────────────────────────────────
  const onPaymentSuccess = () => {
    setStep('done');
    setMessage('🎉 Payment successful! Your booking is confirmed. Check "My Bookings" for details.');
  };

  // ── Review submit ─────────────────────────────────────────────────────────
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { vehicleId: id, ...reviewForm });
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review.');
    }
  };

  if (!vehicle) return <p className="loading-text">Loading vehicle…</p>;

  const images = vehicle.images?.length ? vehicle.images : [];

  return (
    <div className="vehicle-detail">

      {/* ── Image gallery ─────────────────────────────────────────────────── */}
      <div className="gallery">
        {images.length > 0 ? (
          <>
            <img src={images[imgIdx]} alt={vehicle.name} className="gallery-main" />
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <img
                    key={i} src={img} alt=""
                    className={`thumb ${imgIdx === i ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="card-img-placeholder large">
            {vehicle.type === 'car' ? '🚗' : '🏍️'}
          </div>
        )}
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="detail-header">
        <div>
          <h2>{vehicle.name}</h2>
          <p className="detail-sub">
            {vehicle.brand} {vehicle.model} ({vehicle.year}) •{' '}
            <span className="type-tag">{vehicle.type.toUpperCase()}</span>
          </p>
          <p>
            ⭐ {vehicle.averageRating || 'No ratings yet'}
            <span className="muted"> ({vehicle.numReviews} review{vehicle.numReviews !== 1 ? 's' : ''})</span>
            &nbsp;·&nbsp;📍 {vehicle.location}
          </p>
        </div>
        <WishlistButton vehicleId={vehicle._id} />
      </div>

      <p className="detail-description">{vehicle.description}</p>

      <div className="spec-grid">
        <span>💰 <strong>₹{vehicle.pricePerDay}/day</strong></span>
        <span>⚙️ {vehicle.transmission}</span>
        <span>⛽ {vehicle.fuelType}</span>
        <span>🪑 {vehicle.seats} seats</span>
        <span>{vehicle.isAvailable ? '✅ Available' : '❌ Unavailable'}</span>
      </div>

      {/* ── Booking flow ──────────────────────────────────────────────────── */}
      <div className="booking-box">

        {/* Step 1 – select dates */}
        {step === 'select' && (
          <>
            <h3>Select your rental dates</h3>
            <BookingCalendar vehicleId={id} onChange={setCalDates} />

            {totalDays > 0 && (
              <div className="price-summary">
                <div className="payment-row">
                  <span>{totalDays} day{totalDays > 1 ? 's' : ''} × ₹{vehicle.pricePerDay}</span>
                  <strong>₹{basePrice}</strong>
                </div>

                <PromoInput orderTotal={basePrice} onApply={setPromoData} />

                {discount > 0 && (
                  <div className="payment-row discount-line">
                    <span>Promo discount</span>
                    <strong>- ₹{discount}</strong>
                  </div>
                )}

                <div className="payment-row total-row">
                  <span>Total</span>
                  <strong>₹{finalPrice}</strong>
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={confirmBooking}
              disabled={!calDates.available || totalDays === 0}
            >
              Proceed to Payment →
            </button>

            {message && <p className="msg error">{message}</p>}
          </>
        )}

        {/* Step 2 – Razorpay payment */}
        {step === 'payment' && booking && (
          <>
            <h3>Complete Payment</h3>
            <p className="muted">
              Booking created (ID: <code>{booking._id}</code>). Complete payment to confirm your rental.
            </p>
            <RazorpayCheckout
              bookingId={booking._id}
              totalPrice={finalPrice}
              onSuccess={onPaymentSuccess}
            />
            <button
              className="link-btn muted"
              style={{ marginTop: 10 }}
              onClick={() => { setStep('select'); setBooking(null); }}
            >
              ← Go back and change dates
            </button>
          </>
        )}

        {/* Step 3 – done */}
        {step === 'done' && (
          <div className="booking-done">
            <div className="done-icon">🎉</div>
            <p className="success-msg">{message}</p>
            <a href="/my-bookings" className="btn-primary">View My Bookings</a>
          </div>
        )}
      </div>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <div className="reviews-section">
        <h3>Reviews</h3>

        {reviews.length === 0 && <p className="muted">No reviews yet — be the first!</p>}

        {reviews.map((r) => (
          <div key={r._id} className="review">
            <div className="review-header">
              <strong>{r.user?.name || 'User'}</strong>
              <span>{'⭐'.repeat(r.rating)}</span>
            </div>
            <p>{r.comment}</p>
            <small className="muted">{new Date(r.createdAt).toLocaleDateString()}</small>
          </div>
        ))}

        {user && (
          <form onSubmit={submitReview} className="review-form">
            <h4>Leave a review</h4>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            >
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
            </select>
            <textarea
              placeholder="Share your experience…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
}
