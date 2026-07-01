const User    = require('../models/User');
const Booking = require('../models/Booking');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name type images pricePerDay location averageRating');
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).populate('wishlist', 'name type images pricePerDay location averageRating');
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/users/avatar  — file already uploaded to Cloudinary via middleware
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );
    res.json({ avatar: user.avatar });
  } catch (err) { next(err); }
};

// GET /api/users/stats
const getRentalStats = async (req, res, next) => {
  try {
    const [totalBookings, completed, cancelled, revenueAgg] = await Promise.all([
      Booking.countDocuments({ user: req.user._id }),
      Booking.countDocuments({ user: req.user._id, status: 'completed' }),
      Booking.countDocuments({ user: req.user._id, status: 'cancelled' }),
      Booking.aggregate([
        { $match: { user: req.user._id, status: { $in: ['confirmed','completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);
    res.json({
      totalBookings,
      completedTrips: completed,
      cancelledBookings: cancelled,
      totalSpent: revenueAgg[0]?.total || 0,
    });
  } catch (err) { next(err); }
};

// POST /api/users/wishlist/:vehicleId   — toggle
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const vid  = req.params.vehicleId;
    const idx  = user.wishlist.findIndex((id) => id.toString() === vid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else          user.wishlist.push(vid);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, updateAvatar, getRentalStats, toggleWishlist };
