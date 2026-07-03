const DamageReport = require('../models/DamageReport');
const Booking      = require('../models/Booking');
const { createNotification } = require('./notificationController');

// POST /api/damage-reports
// uploadDamagePhotos middleware handles req.files (array 'photos')
const createReport = async (req, res, next) => {
  try {
    const { bookingId, type, description } = req.body;
    if (!bookingId || !type)
      return res.status(400).json({ message: 'bookingId and type are required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only the booking owner can report damage
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const photos = (req.files || []).map((f) => f.path);

    const report = await DamageReport.create({
      booking: bookingId,
      vehicle: booking.vehicle,
      user:    req.user._id,
      type,
      description,
      photos,
    });

    await createNotification({
      userId:  req.user._id,
      title:   'Damage Report Submitted',
      message: `Your ${type} damage report has been submitted for review.`,
      type:    'damage_reported',
      link:    '/my-bookings',
    });

    res.status(201).json(report);
  } catch (err) { next(err); }
};

// GET /api/damage-reports/my  — user's own reports
const getMyReports = async (req, res, next) => {
  try {
    const reports = await DamageReport.find({ user: req.user._id })
      .populate('vehicle', 'name images')
      .populate('booking', 'startDate endDate')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { next(err); }
};

// GET /api/damage-reports  — admin: all reports
const getAllReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reports = await DamageReport.find(filter)
      .populate('vehicle', 'name images')
      .populate('user', 'name email')
      .populate('booking', 'startDate endDate totalPrice')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { next(err); }
};

// PUT /api/damage-reports/:id  — admin reviews/updates
const updateReport = async (req, res, next) => {
  try {
    const { status, severity, penaltyAmount, adminNote } = req.body;
    const report = await DamageReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (status)     report.status        = status;
    if (severity)   report.severity      = severity;
    if (penaltyAmount !== undefined) report.penaltyAmount = penaltyAmount;
    if (adminNote !== undefined)    report.adminNote  = adminNote;
    report.reviewedBy = req.user._id;
    await report.save();

    // Notify the user if charged or resolved
    if (status === 'charged' || status === 'resolved') {
      const booking = await Booking.findById(report.booking).populate('vehicle', 'name');
      await createNotification({
        userId:  report.user,
        title:   status === 'charged' ? 'Damage Penalty Applied' : 'Damage Report Resolved',
        message: status === 'charged'
          ? `A penalty of ₹${penaltyAmount} has been applied for damage to ${booking.vehicle?.name || 'your vehicle'}.`
          : `Your damage report for ${booking.vehicle?.name || 'your vehicle'} has been resolved.`,
        type:    status === 'charged' ? 'damage_charged' : 'damage_resolved',
        link:    '/my-bookings',
      });
    }

    res.json(report);
  } catch (err) { next(err); }
};

module.exports = { createReport, getMyReports, getAllReports, updateReport };
