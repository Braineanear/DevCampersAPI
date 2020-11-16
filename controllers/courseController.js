const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getAllCourses = catchAsync(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }

  const courses = await query;

  if (!courses) {
    return next(new AppError('No Courses Found', 400));
  }

  res.status(200).json({
    status: 'success',
    result: courses.length,
    data: courses
  });
});

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new AppError(`No course found with id of ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc        Add course
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.addCourse = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id of ${req.params.bootcampId}`, 400)
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc        Update course
// @route       GET /api/v1/courses/:id
// @access      Private
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!course) {
    return next(
      new AppError(`No course found with id of ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc        Delete course
// @route       GET /api/v1/courses/:id
// @access      Private
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(
      new AppError(`No course found with id of ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    status: 'success',
    data: null
  });
});
