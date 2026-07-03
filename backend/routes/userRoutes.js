const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, updateAvatar, getRentalStats, toggleWishlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar, uploadKycDocs } = require('../middleware/uploadMiddleware');
const { submitKyc, getKycStatus } = require('../controllers/kycController');
const { getLoyalty, redeemPoints } = require('../controllers/loyaltyController');

router.get('/profile',          protect, getProfile);
router.put('/profile',          protect, updateProfile);
router.put('/avatar',           protect, uploadAvatar, updateAvatar);
router.get('/stats',            protect, getRentalStats);
router.post('/wishlist/:vehicleId', protect, toggleWishlist);

// KYC / Document verification
router.post('/kyc/submit',      protect, uploadKycDocs, submitKyc);
router.get('/kyc/status',       protect, getKycStatus);

// Loyalty / Rewards
router.get('/loyalty',          protect, getLoyalty);
router.post('/loyalty/redeem',  protect, redeemPoints);

module.exports = router;
