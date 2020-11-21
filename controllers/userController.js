const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = catchAsync(async (req, res, next) => {
  // 1) Get user from database
  const user = await User.findById(req.params.id);

  // 2) Check if user exist
  if (!user) {
    return next(new AppError(`No user with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Get user from database
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // 2) Check if user exist to update the data or not
  if (!user) {
    return next(new AppError(`No user with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  // 1) Get user from database
  const user = await User.findByIdAndDelete(req.params.id);

  // 2) Check if user exist to delete the data or not
  if (!user) {
    return next(new AppError(`No user with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {}
  });
});

// @desc      Get current logged in user
// @route     GET /api/v1/users/me
// @access    Private/Current User
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req due to the protect middleware
  const { user } = req;

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc      Delete current logged in user data
// @route     DELETE /api/v1/users/deleteMe
// @access    Private/Current User
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.deleteOne({ _id: req.user.id });

  res.status(200).json({
    status: 'success',
    data: {}
  });
});

// @desc      Update user details
// @route     PATCH /api/v1/users/updatedetails
// @access    Private/Current User
exports.updateDetails = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  }
  const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
