const Promo = require('../models/Promo');

// POST /api/promos/validate  — user validates a code at checkout
const validatePromo = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Promo code required' });

    const promo = await Promo.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!promo) return res.status(404).json({ message: 'Invalid or inactive promo code' });
    if (promo.expiresAt && promo.expiresAt < new Date())
      return res.status(400).json({ message: 'This promo code has expired' });
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses)
      return res.status(400).json({ message: 'This promo code has reached its usage limit' });
    if (promo.usedBy.includes(req.user._id))
      return res.status(400).json({ message: 'You have already used this promo code' });
    if (orderTotal < promo.minOrderValue)
      return res.status(400).json({ message: `Minimum order value is $${promo.minOrderValue}` });

    const discount =
      promo.discountType === 'percentage'
        ? Math.min((orderTotal * promo.discountValue) / 100, orderTotal)
        : Math.min(promo.discountValue, orderTotal);

    res.json({
      valid: true,
      promo: { id: promo._id, code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue },
      discount: parseFloat(discount.toFixed(2)),
      finalTotal: parseFloat((orderTotal - discount).toFixed(2)),
    });
  } catch (err) { next(err); }
};

// POST /api/promos/apply  — mark promo as used after successful booking
const applyPromo = async (req, res, next) => {
  try {
    const { promoId } = req.body;
    await Promo.findByIdAndUpdate(promoId, {
      $inc: { usedCount: 1 },
      $addToSet: { usedBy: req.user._id },
    });
    res.json({ message: 'Promo applied' });
  } catch (err) { next(err); }
};

// ── Admin CRUD ──────────────────────────────────────────────────────────────

const getAllPromos = async (req, res, next) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) { next(err); }
};

const createPromo = async (req, res, next) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json(promo);
  } catch (err) { next(err); }
};

const updatePromo = async (req, res, next) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) return res.status(404).json({ message: 'Promo not found' });
    res.json(promo);
  } catch (err) { next(err); }
};

const deletePromo = async (req, res, next) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });
    res.json({ message: 'Promo deleted' });
  } catch (err) { next(err); }
};

module.exports = { validatePromo, applyPromo, getAllPromos, createPromo, updatePromo, deletePromo };
