const express = require('express');
const router  = express.Router();
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect, adminOnly }        = require('../middleware/authMiddleware');
const { uploadVehicleImages }       = require('../middleware/uploadMiddleware');

router.post('/images', protect, adminOnly, uploadVehicleImages, uploadImages);
router.delete('/image', protect, adminOnly, deleteImage);

module.exports = router;
