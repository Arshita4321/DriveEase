const Booking      = require('../models/Booking');
const Vehicle      = require('../models/Vehicle');
const { createNotification } = require('./notificationController');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/email');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;
    if (!vehicleId || !startDate || !endDate)
      return res.status(400).json({ message: 'vehicleId, startDate and endDate are required' });

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end <= start)
      return res.status(400).json({ message: 'endDate must be after startDate' });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle)      return res.status(404).json({ message: 'Vehicle not found' });
    if (!vehicle.isAvailable) return res.status(400).json({ message: 'Vehicle is not available' });

    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status:  { $in: ['pending','confirmed'] },
      startDate: { $lt: end },
      endDate:   { $gt: start },
    });
    if (overlapping)
      return res.status(409).json({ message: 'Vehicle already booked for selected dates' });

    const totalDays  = Math.max(1, Math.ceil((end - start) / MS_PER_DAY));
    const totalPrice = totalDays * vehicle.pricePerDay;

    const booking = await Booking.create({
      user: req.user._id, vehicle: vehicleId,
      startDate: start, endDate: end, totalDays, totalPrice,
    });

    // In-app notification
    await createNotification({
      userId:  req.user._id,
      title:   'Booking Created',
      message: `Your booking for ${vehicle.name} is pending confirmation.`,
      type:    'booking_new',
      link:    '/my-bookings',
    });

    res.status(201).json(booking);
  } catch (err) { next(err); }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle', 'name type images pricePerDay brand')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle','name')
      .populate('user','name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    booking.status = 'cancelled';
    await booking.save();

    await createNotification({
      userId:  booking.user._id,
      title:   'Booking Cancelled',
      message: `Your booking for ${booking.vehicle.name} has been cancelled.`,
      type:    'booking_cancelled',
      link:    '/my-bookings',
    });

    await sendBookingCancellation({
      to:          booking.user.email,
      name:        booking.user.name,
      vehicleName: booking.vehicle.name,
    });

    res.json(booking);
  } catch (err) { next(err); }
};

// ── Admin ──────────────────────────────────────────────────────────────────

const getAllBookings = async (req, res, next) => {
  try {
    const query   = req.query.status ? { status: req.query.status } : {};
    const bookings = await Booking.find(query)
      .populate('user',   'name email')
      .populate('vehicle','name type pricePerDay')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending','confirmed','cancelled','completed'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('vehicle','name')
      .populate('user','name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Notifications + emails on key transitions
    if (status === 'confirmed') {
      await createNotification({
        userId:  booking.user._id,
        title:   'Booking Confirmed 🎉',
        message: `Your booking for ${booking.vehicle.name} has been confirmed!`,
        type:    'booking_confirmed',
        link:    '/my-bookings',
      });
      await sendBookingConfirmation({
        to:          booking.user.email,
        name:        booking.user.name,
        vehicleName: booking.vehicle.name,
        startDate:   booking.startDate,
        endDate:     booking.endDate,
        totalPrice:  booking.totalPrice,
      });
    }

    if (status === 'cancelled') {
      await createNotification({
        userId:  booking.user._id,
        title:   'Booking Cancelled',
        message: `Your booking for ${booking.vehicle.name} was cancelled by admin.`,
        type:    'booking_cancelled',
        link:    '/my-bookings',
      });
      await sendBookingCancellation({
        to:          booking.user.email,
        name:        booking.user.name,
        vehicleName: booking.vehicle.name,
      });
    }

    res.json(booking);
  } catch (err) { next(err); }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getAllBookings, updateBookingStatus };
