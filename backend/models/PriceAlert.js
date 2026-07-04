const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    originalPrice: { type: Number, required: true, min: 0 },
    active:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceAlertSchema.index({ user: 1, vehicle: 1 }, { unique: true });
priceAlertSchema.index({ active: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
