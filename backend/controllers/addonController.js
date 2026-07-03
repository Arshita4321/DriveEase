const Addon = require('../models/Addon');

// GET /api/addons — list active addons (public, for booking flow)
// GET /api/addons?all=true — list all including inactive (admin)
const getAddons = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.all === 'true') {
      // admin sees everything
    } else {
      filter.isActive = true;
    }
    if (req.query.type) filter.applicableTo = { $in: [req.query.type, 'all'] };
    const addons = await Addon.find(filter).sort({ createdAt: 1 });
    res.json(addons);
  } catch (err) { next(err); }
};

// POST /api/addons (admin)
const createAddon = async (req, res, next) => {
  try {
    const addon = await Addon.create(req.body);
    res.status(201).json(addon);
  } catch (err) { next(err); }
};

// PUT /api/addons/:id (admin)
const updateAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!addon) return res.status(404).json({ message: 'Addon not found' });
    res.json(addon);
  } catch (err) { next(err); }
};

// DELETE /api/addons/:id (admin)
const deleteAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);
    if (!addon) return res.status(404).json({ message: 'Addon not found' });
    res.json({ message: 'Addon deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAddons, createAddon, updateAddon, deleteAddon };
