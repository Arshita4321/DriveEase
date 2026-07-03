const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    priceType:   { type: String, enum: ['per_day', 'flat'], default: 'flat' },
    icon:        { type: String, default: '' },     // react-icons name for frontend
    applicableTo:{ type: String, enum: ['all', 'car', 'bike'], default: 'all' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Addon', addonSchema);
