const User = require('../models/User');
const { createNotification } = require('./notificationController');

// POST /api/users/kyc/submit
// Body: { licenseNumber } + multipart fields licenseImage, idProofImage (handled by upload middleware)
const submitKyc = async (req, res, next) => {
  try {
    const { licenseNumber } = req.body;
    if (!licenseNumber)
      return res.status(400).json({ message: 'License number is required' });

    const licenseImage = req.files?.licenseImage?.[0]?.path || '';
    const idProofImage = req.files?.idProofImage?.[0]?.path || '';

    if (!licenseImage || !idProofImage)
      return res.status(400).json({ message: 'Both license and ID proof images are required' });

    const user = await User.findById(req.user._id);
    user.licenseNumber  = licenseNumber;
    user.licenseImage   = licenseImage;
    user.idProofImage   = idProofImage;
    user.kycStatus      = 'pending';
    user.kycSubmittedAt = new Date();
    user.kycReviewedAt  = null;
    user.kycNote        = '';
    await user.save();

    await createNotification({
      userId:  user._id,
      title:   'KYC Submitted',
      message: 'Your documents have been submitted for verification. We will review them shortly.',
      type:    'kyc_submitted',
      link:    '/profile?tab=kyc',
    });

    res.json({
      message: 'KYC submitted for verification',
      kycStatus: user.kycStatus,
    });
  } catch (err) { next(err); }
};

// GET /api/users/kyc/status
const getKycStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('licenseNumber kycStatus kycSubmittedAt kycReviewedAt kycNote licenseImage idProofImage');
    res.json({
      kycStatus:      user.kycStatus,
      licenseNumber:  user.licenseNumber,
      licenseImage:   user.licenseImage,
      idProofImage:   user.idProofImage,
      kycSubmittedAt: user.kycSubmittedAt,
      kycReviewedAt:  user.kycReviewedAt,
      kycNote:        user.kycNote,
    });
  } catch (err) { next(err); }
};

// GET /api/admin/kyc?status=pending
const getKycSubmissions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'none') {
      filter.kycStatus = req.query.status;
    } else {
      filter.kycStatus = { $in: ['pending', 'approved', 'rejected'] };
    }
    const users = await User.find(filter)
      .select('name email phone avatar licenseNumber licenseImage idProofImage kycStatus kycSubmittedAt kycReviewedAt kycNote')
      .sort({ kycSubmittedAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

// PUT /api/admin/kyc/:userId/approve
const approveKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.kycStatus === 'approved')
      return res.status(400).json({ message: 'KYC already approved' });

    user.kycStatus     = 'approved';
    user.kycReviewedAt = new Date();
    user.kycNote       = '';
    await user.save();

    await createNotification({
      userId:  user._id,
      title:   'KYC Approved',
      message: 'Your documents have been verified. You can now book vehicles!',
      type:    'kyc_approved',
      link:    '/vehicles',
    });

    res.json({ message: 'KYC approved', user });
  } catch (err) { next(err); }
};

// PUT /api/admin/kyc/:userId/reject
const rejectKyc = async (req, res, next) => {
  try {
    const { note } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.kycStatus     = 'rejected';
    user.kycReviewedAt = new Date();
    user.kycNote       = note || 'Documents rejected. Please resubmit.';
    await user.save();

    await createNotification({
      userId:  user._id,
      title:   'KYC Rejected',
      message: user.kycNote,
      type:    'kyc_rejected',
      link:    '/profile?tab=kyc',
    });

    res.json({ message: 'KYC rejected', user });
  } catch (err) { next(err); }
};

module.exports = { submitKyc, getKycStatus, getKycSubmissions, approveKyc, rejectKyc };
