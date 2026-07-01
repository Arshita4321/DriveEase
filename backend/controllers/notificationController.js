const Notification = require('../models/Notification');

// GET /api/notifications  — logged-in user's notifications
const getNotifications = async (req, res, next) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications: notes, unreadCount });
  } catch (err) { next(err); }
};

// PUT /api/notifications/mark-all-read
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Helper — create a notification (called internally by other controllers)
const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error('[Notification] Failed to create:', err.message);
  }
};

module.exports = { getNotifications, markAllRead, markOneRead, deleteNotification, createNotification };
