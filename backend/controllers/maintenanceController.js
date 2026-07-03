const Maintenance = require('../models/Maintenance');
const Vehicle    = require('../models/Vehicle');
const { createNotification } = require('./notificationController');

// GET /api/maintenance  — admin: all maintenance logs
const getAllLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vehicleId) filter.vehicle = req.query.vehicleId;
    const logs = await Maintenance.find(filter)
      .populate('vehicle', 'name type brand images')
      .sort({ serviceDate: -1 });
    res.json(logs);
  } catch (err) { next(err); }
};

// GET /api/maintenance/vehicle/:vehicleId  — logs for a specific vehicle
const getVehicleLogs = async (req, res, next) => {
  try {
    const logs = await Maintenance.find({ vehicle: req.params.vehicleId })
      .sort({ serviceDate: -1 });
    res.json(logs);
  } catch (err) { next(err); }
};

// POST /api/maintenance  — admin: create maintenance log
const createLog = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const log = await Maintenance.create({
      ...req.body,
      vehicle: req.body.vehicleId,
    });

    // If status is 'in_progress' or 'scheduled' with imminent service date,
    // mark vehicle as unavailable
    if (log.status === 'in_progress') {
      vehicle.isAvailable = false;
      await vehicle.save();
    }

    res.status(201).json(log);
  } catch (err) { next(err); }
};

// PUT /api/maintenance/:id  — admin: update maintenance log
const updateLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle', 'name type brand');
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

    // Handle vehicle availability based on status changes
    if (req.body.status) {
      const vehicle = await Vehicle.findById(log.vehicle);
      if (vehicle) {
        if (req.body.status === 'in_progress') {
          vehicle.isAvailable = false;
        } else if (req.body.status === 'completed') {
          // Only re-enable if no other in-progress maintenance
          const activeMaintenance = await Maintenance.countDocuments({
            vehicle: vehicle._id,
            status: 'in_progress',
          });
          if (activeMaintenance === 0) vehicle.isAvailable = true;
        }
        await vehicle.save();
      }
    }

    res.json(log);
  } catch (err) { next(err); }
};

// DELETE /api/maintenance/:id  — admin: delete maintenance log
const deleteLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });
    res.json({ message: 'Maintenance log deleted' });
  } catch (err) { next(err); }
};

// GET /api/maintenance/upcoming  — admin: upcoming maintenance due
const getUpcoming = async (req, res, next) => {
  try {
    const now = new Date();
    const logs = await Maintenance.find({
      nextDueDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' },
    })
      .populate('vehicle', 'name type brand')
      .sort({ nextDueDate: 1 });
    res.json(logs);
  } catch (err) { next(err); }
};

module.exports = { getAllLogs, getVehicleLogs, createLog, updateLog, deleteLog, getUpcoming };
