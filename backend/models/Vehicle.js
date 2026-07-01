const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['car', 'bike'], required: true },
    brand: { type: String, required: true },
    model: { type: String, default: '' },
    year: { type: Number },
    pricePerDay: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    transmission: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], default: 'petrol' },
    seats: { type: Number, default: 4 },
    description: { type: String, default: '' },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

vehicleSchema.index({ type: 1, location: 1, pricePerDay: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
