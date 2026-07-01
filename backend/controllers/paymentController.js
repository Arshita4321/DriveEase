const crypto  = require('crypto');
const Razorpay = require('razorpay');
const Booking  = require('../models/Booking');
const { createNotification } = require('./notificationController');
const { sendBookingConfirmation } = require('../utils/email');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── POST /api/payments/create-order ────────────────────────────────────────
// Creates a Razorpay order for a given booking.
// The frontend uses the returned order_id to open the Razorpay checkout modal.
const createOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay)
      return res.status(503).json({ message: 'Payments are not configured on this server.' });

    const { bookingId } = req.body;
    if (!bookingId)
      return res.status(400).json({ message: 'bookingId is required' });

    const booking = await Booking.findById(bookingId)
      .populate('vehicle', 'name')
      .populate('user',    'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Booking is already paid' });

    // Razorpay amount is in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(booking.totalPrice * 100);

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
      receipt:  `booking_${booking._id}`,
      notes: {
        bookingId:   booking._id.toString(),
        vehicleName: booking.vehicle?.name || '',
        userEmail:   booking.user?.email   || '',
      },
    });

    // Persist Razorpay order id so we can verify later
    booking.paymentIntentId = order.id;
    await booking.save();

    res.json({
      orderId:   order.id,
      amount:    order.amount,       // paise
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      // Prefill info for the checkout modal
      prefill: {
        name:  booking.user?.name  || '',
        email: booking.user?.email || '',
      },
      description: `DriveEase – ${booking.vehicle?.name || 'Vehicle'} rental`,
    });
  } catch (err) { next(err); }
};

// ─── POST /api/payments/verify ───────────────────────────────────────────────
// Called by the frontend after the Razorpay modal fires onSuccess.
// Verifies the HMAC-SHA256 signature Razorpay attaches to every payment.
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId)
      return res.status(400).json({ message: 'Missing payment verification fields' });

    // Razorpay signature = HMAC-SHA256(order_id + '|' + payment_id, key_secret)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed – invalid signature' });

    // Signature valid → mark booking as paid + confirmed
    const booking = await Booking.findById(bookingId)
      .populate('vehicle', 'name')
      .populate('user',    'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus   = 'paid';
    booking.status          = 'confirmed';
    booking.paymentIntentId = razorpay_payment_id; // store payment_id for refund reference
    await booking.save();

    // Notifications + confirmation email
    await createNotification({
      userId:  booking.user._id,
      title:   'Booking Confirmed 🎉',
      message: `Payment received! Your booking for ${booking.vehicle?.name} is confirmed.`,
      type:    'booking_confirmed',
      link:    '/my-bookings',
    });

    await sendBookingConfirmation({
      to:          booking.user.email,
      name:        booking.user.name,
      vehicleName: booking.vehicle?.name,
      startDate:   booking.startDate,
      endDate:     booking.endDate,
      totalPrice:  booking.totalPrice,
    });

    res.json({ message: 'Payment verified and booking confirmed', booking });
  } catch (err) { next(err); }
};

// ─── POST /api/payments/refund ───────────────────────────────────────────────
// Admin-initiated refund for a paid cancelled booking
const refundPayment = async (req, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Payments not configured' });

    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)               return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus !== 'paid')
      return res.status(400).json({ message: 'Booking is not paid – nothing to refund' });

    const refund = await razorpay.payments.refund(booking.paymentIntentId, {
      amount: Math.round(booking.totalPrice * 100), // full refund in paise
      notes:  { reason: 'Booking cancelled by admin – DriveEase refund' },
    });

    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ message: 'Refund initiated', refund });
  } catch (err) { next(err); }
};

module.exports = { createOrder, verifyPayment, refundPayment };
