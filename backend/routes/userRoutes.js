const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, updateAvatar, getRentalStats, toggleWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

router.get('/profile',          protect, getProfile);
router.put('/profile',          protect, updateProfile);
router.put('/avatar',           protect, uploadAvatar, updateAvatar);
router.get('/stats',            protect, getRentalStats);
router.post('/wishlist/:vehicleId', protect, toggleWishlist);

module.exports = router;
