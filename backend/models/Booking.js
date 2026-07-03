const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // Dynamic pricing breakdown
    basePrice:       { type: Number, default: 0 },        // pricePerDay × totalDays before discounts
    weekendSurcharge: { type: Number, default: 0 },
    discountAmount:  { type: Number, default: 0 },
    addonTotal:      { type: Number, default: 0 },

    // Selected add-ons (denormalized snapshot)
    selectedAddons: [{
      addon:    { type: mongoose.Schema.Types.ObjectId, ref: 'Addon' },
      name:     { type: String, required: true },
      price:    { type: Number, required: true },
      priceType:{ type: String, enum: ['per_day', 'flat'], default: 'flat' },
    }],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paymentIntentId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
