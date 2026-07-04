const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyAlerts, toggleAlert, removeAlert } = require('../controllers/priceAlertController');

router.get('/', protect, getMyAlerts);
router.post('/:vehicleId', protect, toggleAlert);
router.delete('/:vehicleId', protect, removeAlert);

module.exports = router;
