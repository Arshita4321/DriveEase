const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');
const { createNotification } = require('./notificationController');

// @desc Employee dashboard stats — focused on daily operations
// @route GET /api/employee/dashboard
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayPickups,
      todayReturns,
      activeBookings,
      pendingBookings,
      availableVehicles,
      totalVehicles,
      inMaintenance,
    ] = await Promise.all([
      // Bookings starting today (pickups)
      Booking.countDocuments({
        startDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'pending'] },
      }),
      // Bookings ending today (returns)
      Booking.countDocuments({
        endDate: { $gte: today, $lt: tomorrow },
        status: 'confirmed',
      }),
      // All currently active bookings
      Booking.countDocuments({
        status: 'confirmed',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      // Pending confirmation
      Booking.countDocuments({ status: 'pending' }),
      Vehicle.countDocuments({ isAvailable: true }),
      Vehicle.countDocuments(),
      Maintenance.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } }),
    ]);

    // Today's schedule — pickups
    const pickupsToday = await Booking.find({
      startDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'pending'] },
    })
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type brand images')
      .sort({ startDate: 1 })
      .limit(10);

    // Today's schedule — returns
    const returnsToday = await Booking.find({
      endDate: { $gte: today, $lt: tomorrow },
      status: 'confirmed',
    })
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type brand images')
      .sort({ endDate: 1 })
      .limit(10);

    res.json({
      todayPickups,
      todayReturns,
      counts: {
        todayPickups: todayPickups,
        todayReturns: todayReturns,
        activeBookings,
        pendingBookings,
        availableVehicles,
        totalVehicles,
        inMaintenance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all bookings for employee view (with filters)
// @route GET /api/employee/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type brand images pricePerDay')
      .sort({ createdAt: -1 });

    // Client-side search filter (by user name or vehicle name)
    if (search) {
      const s = search.toLowerCase();
      const filtered = bookings.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(s) ||
          b.vehicle?.name?.toLowerCase().includes(s) ||
          b.vehicle?.brand?.toLowerCase().includes(s)
      );
      return res.json(filtered);
    }

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// @desc Check-out: confirm a booking (vehicle goes to customer)
// @route PUT /api/employee/bookings/:id/checkout
const checkoutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'name')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending' && booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Only pending or confirmed bookings can be checked out' });

    // Mark vehicle as unavailable
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { isAvailable: false });

    booking.status = 'confirmed';
    await booking.save();

    await createNotification({
      userId: booking.user._id,
      title: 'Vehicle Checked Out 🚗',
      message: `Your ${booking.vehicle.name} is ready! Enjoy your ride.`,
      type: 'booking_confirmed',
      link: '/my-bookings',
    });

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type brand images pricePerDay');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc Check-in: complete a booking (vehicle returned)
// @route PUT /api/employee/bookings/:id/checkin
const checkinBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'name')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Only confirmed bookings can be checked in' });

    // Mark vehicle as available again
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { isAvailable: true });

    booking.status = 'completed';
    await booking.save();

    await createNotification({
      userId: booking.user._id,
      title: 'Vehicle Returned ✅',
      message: `Your booking for ${booking.vehicle.name} has been completed. Thank you!`,
      type: 'booking_completed',
      link: '/my-bookings',
    });

    const updated = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type brand images pricePerDay');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc Get vehicles with availability status
// @route GET /api/employee/vehicles
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// @desc Toggle vehicle availability (maintenance / back to fleet)
// @route PUT /api/employee/vehicles/:id/toggle-availability
const toggleVehicleAvailability = async (req, res, next) => {
  try {
    const { isAvailable, reason } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    vehicle.isAvailable = isAvailable;
    await vehicle.save();

    // If marking as unavailable, optionally create a maintenance request
    if (!isAvailable && reason) {
      await Maintenance.create({
        vehicle: vehicle._id,
        type: 'repair',
        description: reason,
        serviceDate: new Date(),
        status: 'scheduled',
      });
    }

    res.json({ message: `Vehicle marked as ${isAvailable ? 'available' : 'unavailable'}`, vehicle });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployeeDashboard,
  getBookings,
  checkoutBooking,
  checkinBooking,
  getVehicles,
  toggleVehicleAvailability,
};

