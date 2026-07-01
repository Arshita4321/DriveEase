const express = require('express');
const router  = express.Router();
const { validatePromo, applyPromo, getAllPromos, createPromo, updatePromo, deletePromo } = require('../controllers/promoController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/validate', protect, validatePromo);
router.post('/apply',    protect, applyPromo);

// Admin
router.get('/',          protect, adminOnly, getAllPromos);
router.post('/',         protect, adminOnly, createPromo);
router.put('/:id',       protect, adminOnly, updatePromo);
router.delete('/:id',    protect, adminOnly, deletePromo);

module.exports = router;
