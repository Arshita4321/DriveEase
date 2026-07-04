const PriceAlert = require('../models/PriceAlert');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

// GET /api/price-alerts — list user's active alerts
const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user._id })
      .populate('vehicle', 'name images pricePerDay')
      .sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) { next(err); }
};

// POST /api/price-alerts/:vehicleId — toggle alert for a vehicle
const toggleAlert = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const existing = await PriceAlert.findOne({ user: req.user._id, vehicle: vehicleId });
    if (existing) {
      existing.active = !existing.active;
      if (existing.active) existing.originalPrice = vehicle.pricePerDay;
      await existing.save();
      return res.json({ alert: existing, active: existing.active });
    }

    const alert = await PriceAlert.create({
      user: req.user._id,
      vehicle: vehicleId,
      originalPrice: vehicle.pricePerDay,
      active: true,
    });
    res.status(201).json({ alert, active: true });
  } catch (err) { next(err); }
};

// DELETE /api/price-alerts/:vehicleId
const removeAlert = async (req, res, next) => {
  try {
    await PriceAlert.findOneAndDelete({ user: req.user._id, vehicle: req.params.vehicleId });
    res.json({ message: 'Alert removed' });
  } catch (err) { next(err); }
};

// Helper — scheduler calls this to detect price drops and notify users
const checkPriceDrops = async () => {
  try {
    const activeAlerts = await PriceAlert.find({ active: true }).populate('vehicle', 'name pricePerDay');
    let notified = 0;

    for (const alert of activeAlerts) {
      if (!alert.vehicle) continue;
      const currentPrice = alert.vehicle.pricePerDay;
      if (currentPrice < alert.originalPrice) {
        const drop = alert.originalPrice - currentPrice;
        await Notification.create({
          user: alert.user,
          title: 'Price drop alert',
          message: `${alert.vehicle.name} is now ₹${currentPrice}/day (down ₹${drop}). Book before it goes up!`,
          type: 'system',
          link: `/vehicles/${alert.vehicle._id}`,
        });
        alert.active = false; // one-shot alert
        await alert.save();
        notified++;
      }
    }
    return notified;
  } catch (err) {
    console.error('[PriceAlert] checkPriceDrops error:', err.message);
    return 0;
  }
};

module.exports = { getMyAlerts, toggleAlert, removeAlert, checkPriceDrops };
