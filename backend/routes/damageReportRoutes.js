const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReport } = require('../controllers/damageReportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadDamagePhotos } = require('../middleware/uploadMiddleware');

// User endpoints
router.post('/',            protect, uploadDamagePhotos, createReport);
router.get('/my',           protect, getMyReports);

// Admin endpoints
router.get('/',             protect, adminOnly, getAllReports);
router.put('/:id',          protect, adminOnly, updateReport);

module.exports = router;
