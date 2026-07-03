const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema(
  {
    booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    vehicle:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    type:      { type: String, enum: ['pre-trip', 'post-trip'], required: true },
    photos:    [{ type: String }],          // Cloudinary URLs
    description: { type: String, default: '', trim: true },
    severity:  { type: String, enum: ['none', 'minor', 'moderate', 'severe'], default: 'none' },
    penaltyAmount: { type: Number, default: 0, min: 0 },
    status:    { type: String, enum: ['reported', 'reviewed', 'resolved', 'charged'], default: 'reported' },
    adminNote: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

damageReportSchema.index({ booking: 1, type: 1 });

module.exports = mongoose.model('DamageReport', damageReportSchema);
