const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  updateUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.put('/users/:id', updateUser);

module.exports = router;
