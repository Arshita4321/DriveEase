const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status:      { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
    dueDate:     { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
