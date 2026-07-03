const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:        { type: String, enum: ['earned', 'redeemed'], required: true },
    points:      { type: Number, required: true },       // positive for earned, negative for redeemed
    booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

loyaltyTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
