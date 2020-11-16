const multer = require('multer');

const Bootcamp = require('../models/bootcampModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const geocoder = require('../utils/geocoder');

// @desc    Get All Bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getAllBootcamps = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Bootcamp.find().populate('courses'),
    req.body
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bootcamps = await features.query;

  if (!bootcamps) {
    return next(new AppError('No Bootcamps Found', 400));
  }

  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    reults: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Get Single Bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Create New Bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
exports.createBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc    Update Bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Delete Bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.status(200).json({
    status: 'success',
    data: {}
  });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = catchAsync(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians
  // Divide distance by radius of Earth
  // Earth radius = 3.963 mi / 6.378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    result: bootcamps.length,
    data: bootcamps
  });
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    //user-id-currentsTimeTemp.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `bootcamp-${req.params.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new AppError('Not an image! Please upload only images.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: process.env.MAX_FILE_UPLOAD }
}).single('photo');

// @desc    Delete Bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  upload(req, res, function () {
    if (req.fileValidationError) {
      return next(
        new AppError('Not an image! Please upload only images.', 400)
      );
    }
    if (!req.file) {
      return next(new AppError('Please select an image to upload', 404));
    }

    res.status(200).json({
      status: 'success',
      link: req.file.path
    });
  });
});
