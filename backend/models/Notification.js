const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type:    {
      type: String,
      enum: ['booking_new','booking_confirmed','booking_cancelled','booking_reminder','system'],
      default: 'system',
    },
    isRead:  { type: Boolean, default: false },
    link:    { type: String, default: '' }, // optional deep-link e.g. /my-bookings
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
