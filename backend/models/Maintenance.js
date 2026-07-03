const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type:         { type: String, enum: ['oil_change', 'tire_rotation', 'general_service', 'repair', 'inspection', 'other'], required: true },
    description:  { type: String, default: '', trim: true },
    cost:         { type: Number, default: 0, min: 0 },
    serviceDate:  { type: Date, required: true },
    nextDueDate:  { type: Date, default: null },
    odometer:     { type: Number, default: 0 },
    status:       { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
    performedBy:  { type: String, default: '' },   // mechanic/service center name
    notes:        { type: String, default: '' },
  },
  { timestamps: true }
);

maintenanceSchema.index({ vehicle: 1, serviceDate: -1 });
maintenanceSchema.index({ status: 1, nextDueDate: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
