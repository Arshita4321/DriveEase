const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Addon   = require('../models/Addon');
const { calculatePricing } = require('../utils/pricing');

// @desc Get all vehicles with filters/search
// @route GET /api/vehicles
const getVehicles = async (req, res, next) => {
  try {
    const { type, location, minPrice, maxPrice, search, available, sort } = req.query;
    const query = {};

    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (available === 'true') query.isAvailable = true;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { pricePerDay: 1 };
    if (sort === 'price_desc') sortOption = { pricePerDay: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const vehicles = await Vehicle.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Vehicle.countDocuments(query);

    res.json({ vehicles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @desc Get single vehicle
// @route GET /api/vehicles/:id
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// @desc Check real-time availability for date range
// @route GET /api/vehicles/:id/availability?startDate=&endDate=
const checkAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const overlapping = await Booking.findOne({
      vehicle: vehicle._id,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    });

    res.json({ available: vehicle.isAvailable && !overlapping });
  } catch (err) {
    next(err);
  }
};

// @desc Pricing preview for a vehicle + date range + selected addons
// @route GET /api/vehicles/:id/pricing?startDate=&endDate=&addonIds=id1,id2
const getPricingPreview = async (req, res, next) => {
  try {
    const { startDate, endDate, addonIds } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ message: 'startDate and endDate are required' });

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    let selectedAddons = [];
    if (addonIds) {
      const ids = addonIds.split(',').filter(Boolean);
      if (ids.length > 0) {
        const addons = await Addon.find({ _id: { $in: ids }, isActive: true });
        selectedAddons = addons.map((a) => ({ name: a.name, price: a.price, priceType: a.priceType }));
      }
    }

    const pricing = calculatePricing(vehicle, startDate, endDate, selectedAddons);
    res.json({ ...pricing, pricePerDay: vehicle.pricePerDay });
  } catch (err) { next(err); }
};

// @desc Create vehicle (admin)
// @route POST /api/vehicles
const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// @desc Update vehicle (admin)
// @route PUT /api/vehicles/:id
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// @desc Delete vehicle (admin)
// @route DELETE /api/vehicles/:id
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  checkAvailability,
  getPricingPreview,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
