const crypto      = require('crypto');
const User        = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordReset } = require('../utils/email');

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user  = await User.create({ name, email, password, phone });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, kycStatus: user.kycStatus, loyaltyPoints: user.loyaltyPoints, loyaltyTier: user.loyaltyTier } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBlocked)
      return res.status(403).json({ message: 'Account blocked. Contact support.' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, kycStatus: user.kycStatus, loyaltyPoints: user.loyaltyPoints, loyaltyTier: user.loyaltyTier } });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res) => res.json({ user: req.user });

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
    // Always return 200 to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken  = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendPasswordReset({ to: user.email, name: user.name, resetUrl });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user   = await User.findOne({
      passwordResetToken:   hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });
    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    user.password             = req.body.password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ token, message: 'Password reset successful' });
  } catch (err) { next(err); }
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword };
