const User               = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Booking            = require('../models/Booking');
const Promo              = require('../models/Promo');
const { createNotification } = require('./notificationController');

// Tier thresholds
const TIERS = {
  bronze: { min: 0,    label: 'Bronze', earnMultiplier: 1,    redeemRate: 0.5 }, // 100 pts = ₹50
  silver: { min: 500,  label: 'Silver', earnMultiplier: 1.2,  redeemRate: 0.6 }, // 100 pts = ₹60
  gold:   { min: 2000, label: 'Gold',   earnMultiplier: 1.5,  redeemRate: 0.75 }, // 100 pts = ₹75
};

const POINTS_PER_RUPEE = 0.1; // 1 point per ₹10 spent
const REDEEM_BATCH = 100;     // minimum redemption batch

function getTier(points) {
  if (points >= TIERS.gold.min)   return 'gold';
  if (points >= TIERS.silver.min) return 'silver';
  return 'bronze';
}

// Award points when a booking is completed
const awardPoints = async (userId, bookingId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const tier = getTier(user.loyaltyPoints);
    const multiplier = TIERS[tier].earnMultiplier;
    const points = Math.round(amount * POINTS_PER_RUPEE * multiplier);

    user.loyaltyPoints += points;
    const newTier = getTier(user.loyaltyPoints);
    const tierUpgraded = newTier !== user.loyaltyTier;
    user.loyaltyTier = newTier;
    await user.save();

    await LoyaltyTransaction.create({
      user: userId,
      type: 'earned',
      points,
      booking: bookingId,
      description: `Points earned from booking (₹${amount} spent)`,
    });

    if (tierUpgraded) {
      await createNotification({
        userId,
        title:   `Loyalty Tier Upgraded to ${TIERS[newTier].label}!`,
        message: `Congratulations! You've been upgraded to ${TIERS[newTier].label} tier. Enjoy better rewards!`,
        type:    'loyalty_upgrade',
        link:    '/profile?tab=loyalty',
      });
    }
  } catch (err) {
    console.error('[Loyalty] Award failed:', err.message);
  }
};

// GET /api/users/loyalty — get loyalty summary + recent transactions
const getLoyalty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints loyaltyTier');
    const transactions = await LoyaltyTransaction.find({ user: req.user._id })
      .populate('booking', 'vehicle totalPrice')
      .sort({ createdAt: -1 })
      .limit(20);

    const tier = TIERS[user.loyaltyTier];
    const nextTier = user.loyaltyTier === 'bronze' ? 'silver' : user.loyaltyTier === 'silver' ? 'gold' : null;
    const pointsToNextTier = nextTier ? TIERS[nextTier].min - user.loyaltyPoints : 0;

    res.json({
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      tierLabel: tier.label,
      earnMultiplier: tier.earnMultiplier,
      redeemRate: tier.redeemRate,
      nextTier: nextTier ? TIERS[nextTier].label : null,
      pointsToNextTier: Math.max(0, pointsToNextTier),
      redeemValue: Math.floor(user.loyaltyPoints / REDEEM_BATCH) * tier.redeemRate * REDEEM_BATCH, // current redeemable value
      transactions,
    });
  } catch (err) { next(err); }
};

// POST /api/users/loyalty/redeem — redeem points for a promo code
const redeemPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    if (!points || points < REDEEM_BATCH)
      return res.status(400).json({ message: `Minimum ${REDEEM_BATCH} points required to redeem` });

    const user = await User.findById(req.user._id);
    if (user.loyaltyPoints < points)
      return res.status(400).json({ message: 'Insufficient points' });

    const tier = TIERS[user.loyaltyTier];
    const discountValue = Math.floor(points / REDEEM_BATCH) * tier.redeemRate * REDEEM_BATCH;
    const code = `LOYAL${user._id.toString().slice(-4)}${Date.now().toString().slice(-4)}`.toUpperCase();

    // Create a promo code for the user
    const promo = await Promo.create({
      code,
      description: `Loyalty redemption — ${points} points`,
      discountType: 'flat',
      discountValue,
      maxUses: 1,
      isActive: true,
    });

    user.loyaltyPoints -= points;
    await user.save();

    await LoyaltyTransaction.create({
      user: req.user._id,
      type: 'redeemed',
      points: -points,
      description: `Redeemed ${points} points for promo code ${code} (₹${discountValue} off)`,
    });

    await createNotification({
      userId:  req.user._id,
      title:   'Loyalty Points Redeemed',
      message: `You've redeemed ${points} points for promo code ${code} worth ₹${discountValue}!`,
      type:    'loyalty_redeemed',
      link:    '/profile?tab=loyalty',
    });

    res.json({
      message: 'Points redeemed successfully',
      code: promo.code,
      discountValue,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (err) { next(err); }
};

module.exports = { getLoyalty, redeemPoints, awardPoints, getTier, TIERS, POINTS_PER_RUPEE };
