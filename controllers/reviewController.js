const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Bootcamp = require('../models/bootcampModel');

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
exports.getReviews = catchAsync(async (req, res, next) => {
  // Get all reviews for a specific bootcamp id
  if (req.params.bootcampId) {
    // 1) Get all reviews related to the bootcamp id
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    // 2) Check if there is any reviews related to the bootcamp id
    if (!reviews) {
      return next(new AppError('No Courses Found', 400));
    }
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  }

  // Get All reviews
  res.status(200).json(res.advancedResults);
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = catchAsync(async (req, res, next) => {
  // 1) Get review from database and populate the bootcamp
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  // 2) Check if review exist
  if (!review) {
    return next(
      new AppError(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Add review
// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @access    Private
exports.addReview = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  // 1) Get bootcamp from database
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // 2) Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp with the id of ${req.params.bootcampId}`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc      Update review
// @route     PATCH /api/v1/reviews/:id
// @access    Private
exports.updateReview = catchAsync(async (req, res, next) => {
  // 1) Get review from database
  let review = await Review.findById(req.params.id);

  // 2) review if course exist
  if (!review) {
    return next(new AppError(`No review with the id of ${req.params.id}`, 404));
  }

  // 3) Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to update review`, 401));
  }

  // 4) Update review
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = catchAsync(async (req, res, next) => {
  // 1) Get review from database
  const review = await Review.findById(req.params.id);

  // 2) Check if review exist
  if (!review) {
    return next(new AppError(`No review with the id of ${req.params.id}`, 404));
  }

  // 3) Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`Not authorized to update review`, 401));
  }

  // 4) Remove review
  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
