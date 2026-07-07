const express = require('express');
const router = express.Router();
const {
  getEmployeeDashboard,
  getBookings,
  checkoutBooking,
  checkinBooking,
  getVehicles,
  toggleVehicleAvailability,
} = require('../controllers/employeeController');
const { protect, employeeOnly } = require('../middleware/authMiddleware');

router.use(protect, employeeOnly);

router.get('/dashboard', getEmployeeDashboard);
router.get('/bookings', getBookings);
router.put('/bookings/:id/checkout', checkoutBooking);
router.put('/bookings/:id/checkin', checkinBooking);
router.get('/vehicles', getVehicles);
router.put('/vehicles/:id/toggle-availability', toggleVehicleAvailability);

module.exports = router;
