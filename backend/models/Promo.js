const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String, default: '' },
    discountType:  { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxUses:       { type: Number, default: 0 },  // 0 = unlimited
    usedCount:     { type: Number, default: 0 },
    expiresAt:     { type: Date },
    isActive:      { type: Boolean, default: true },
    usedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promo', promoSchema);
