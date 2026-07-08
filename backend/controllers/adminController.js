const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc Dashboard summary metrics
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalVehicles, availableVehicles, activeBookings, totalBookings] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ isAvailable: true }),
        Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        Booking.countDocuments(),
      ]);

    const rentedVehicles = totalVehicles - availableVehicles;

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Revenue over the last 6 months for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      activeBookings,
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      bookingsByStatus,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all users (admin)
// @route GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc Block/unblock a user
// @route PUT /api/admin/users/:id/toggle-block
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block an admin' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (err) {
    next(err);
  }
};

// @desc Update user details (admin)
// @route PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc Create a new admin user
// @route POST /api/admin/users
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const admin = await User.create({ name, email, password, phone, role: 'admin' });
    const { password: _, ...safeAdmin } = admin.toObject();
    res.status(201).json(safeAdmin);
  } catch (err) {
    next(err);
  }
};

// @desc Send a broadcast notification to all users (or filtered by role)
// @route POST /api/admin/broadcast
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message)
      return res.status(400).json({ message: 'Title and message are required' });

    // Build query: all users, or only a specific role
    const query = {};
    if (targetRole && targetRole !== 'all') {
      query.role = targetRole;
    }

    const users = await User.find(query).select('_id');
    const notifications = users.map((u) => ({
      user: u._id,
      title,
      message,
      type: 'system',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: `Notification sent to ${notifications.length} user(s)` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getUsers, toggleBlockUser, updateUser, createAdmin, broadcastNotification };
