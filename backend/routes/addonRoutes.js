const express = require('express');
const router = express.Router();
const { getAddons, createAddon, updateAddon, deleteAddon } = require('../controllers/addonController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public: list active addons (for booking flow)
router.get('/', getAddons);

// Admin CRUD
router.post('/',         protect, adminOnly, createAddon);
router.put('/:id',       protect, adminOnly, updateAddon);
router.delete('/:id',    protect, adminOnly, deleteAddon);

module.exports = router;
