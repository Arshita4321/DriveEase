const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  checkAvailability,
  getPricingPreview,
  estimateTripCost,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/pricing',     getPricingPreview);
router.post('/:id/estimate-cost', estimateTripCost);

router.post('/', protect, adminOnly, createVehicle);
router.put('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

module.exports = router;
