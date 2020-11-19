const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getAllCourses = catchAsync(async (req, res, next) => {
  // Get all courses for a specific bootcamp id
  if (req.params.bootcampId) {
    // 1) Get all courses related to the bootcamp id
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    // 2) Check if there is any courses related to the bootcamp id
    if (!courses) {
      return next(new AppError('No Courses Found', 400));
    }

    return res.status(200).json({
      status: 'success',
      result: courses.length,
      data: courses
    });
  }

  // Get All Courses
  res.status(200).json(res.advancedResults);
});

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = catchAsync(async (req, res, next) => {
  // 1) Get course from database and populate the bootcamp
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  // 2) Check if course exist
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
  req.body.user = req.user.id;

  // 1) Get bootcamp from database
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // 2) Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id of ${req.params.bootcampId}`, 400)
    );
  }

  // 3) Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc        Update course
// @route       PATCH /api/v1/courses/:id
// @access      Private
exports.updateCourse = catchAsync(async (req, res, next) => {
  // 1) Get course from database
  let course = await Course.findById(req.params.id);

  // 2) Check if course exist
  if (!course) {
    return next(
      new AppError(`No course found with id of ${req.params.id}`, 400)
    );
  }
  // 3) Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  // 4) Update course
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  course.constructor.getAverageCost(course.bootcamp);
  await course.save();

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc        Delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = catchAsync(async (req, res, next) => {
  // 1) Get course from database
  let course = await Course.findById(req.params.id);

  // 2) Check if course exist
  if (!course) {
    return next(
      new AppError(`No course found with id of ${req.params.id}`, 400)
    );
  }

  // 3) Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  // 4) Delete course
  course = await Course.findByIdAndDelete(req.params.id);

  await course.remove();

  res.status(200).json({
    status: 'success',
    data: null
  });
});
