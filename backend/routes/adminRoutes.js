const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  updateUser,
  createAdmin,
} = require('../controllers/adminController');
const { getKycSubmissions, approveKyc, rejectKyc } = require('../controllers/kycController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createAdmin);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.put('/users/:id', updateUser);

// KYC verification
router.get('/kyc',                    getKycSubmissions);
router.put('/kyc/:userId/approve',    approveKyc);
router.put('/kyc/:userId/reject',     rejectKyc);

module.exports = router;
