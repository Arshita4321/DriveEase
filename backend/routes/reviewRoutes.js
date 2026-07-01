const express = require('express');
const router = express.Router();
const {
  addReview,
  getVehicleReviews,
  getAllReviews,
  toggleReviewVisibility,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/vehicle/:vehicleId', getVehicleReviews);

router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id/toggle-visibility', protect, adminOnly, toggleReviewVisibility);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
