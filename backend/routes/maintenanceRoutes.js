const express = require('express');
const router = express.Router();
const { getAllLogs, getVehicleLogs, createLog, updateLog, deleteLog, getUpcoming } = require('../controllers/maintenanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/',                    getAllLogs);
router.get('/upcoming',            getUpcoming);
router.get('/vehicle/:vehicleId',  getVehicleLogs);
router.post('/',                   createLog);
router.put('/:id',                 updateLog);
router.delete('/:id',              deleteLog);

module.exports = router;
