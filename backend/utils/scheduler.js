const cron        = require('node-cron');
const Booking     = require('../models/Booking');
const Notification= require('../models/Notification');
const { sendBookingReminder } = require('./email');

// Runs every day at 8:00 AM — sends reminders for bookings starting tomorrow
const startScheduler = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily booking reminders...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
      const dayEnd   = new Date(tomorrow.setHours(23, 59, 59, 999));

      const bookings = await Booking.find({
        status:    'confirmed',
        startDate: { $gte: dayStart, $lte: dayEnd },
      }).populate('user', 'name email').populate('vehicle', 'name');

      for (const b of bookings) {
        if (!b.user || !b.vehicle) continue;

        await Notification.create({
          user:    b.user._id,
          title:   'Rental starts tomorrow!',
          message: `Your booking for ${b.vehicle.name} starts tomorrow. Have a great ride!`,
          type:    'booking_reminder',
          link:    '/my-bookings',
        });

        await sendBookingReminder({
          to:          b.user.email,
          name:        b.user.name,
          vehicleName: b.vehicle.name,
          startDate:   b.startDate,
        });
      }
      console.log(`[Scheduler] Sent ${bookings.length} reminder(s).`);
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  });

  console.log('[Scheduler] Booking reminder job scheduled (daily 08:00).');
};

module.exports = { startScheduler };
