const Review = require('../models/Review');
const Vehicle = require('../models/Vehicle');

const recalculateRating = async (vehicleId) => {
  const reviews = await Review.find({ vehicle: vehicleId, isHidden: false });
  const numReviews = reviews.length;
  const averageRating = numReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
    : 0;
  await Vehicle.findByIdAndUpdate(vehicleId, {
    averageRating: averageRating.toFixed(1),
    numReviews,
  });
};

// @desc Add review for a vehicle
// @route POST /api/reviews
const addReview = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment, bookingId } = req.body;
    const exists = await Review.findOne({ vehicle: vehicleId, user: req.user._id });
    if (exists) return res.status(400).json({ message: 'You already reviewed this vehicle' });

    const review = await Review.create({
      vehicle: vehicleId,
      user: req.user._id,
      booking: bookingId,
      rating,
      comment,
    });
    await recalculateRating(vehicleId);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// @desc Get reviews for a vehicle
// @route GET /api/reviews/vehicle/:vehicleId
const getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId, isHidden: false })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// @desc Admin: get all reviews
// @route GET /api/reviews
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('vehicle', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// @desc Admin: hide/unhide or delete a review
// @route PUT /api/reviews/:id/toggle-visibility
const toggleReviewVisibility = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.isHidden = !review.isHidden;
    await review.save();
    await recalculateRating(review.vehicle);
    res.json(review);
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await recalculateRating(review.vehicle);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addReview,
  getVehicleReviews,
  getAllReviews,
  toggleReviewVisibility,
  deleteReview,
};
