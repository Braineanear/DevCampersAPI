const multer = require('multer');

const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const geocoder = require('../utils/geocoder');

// @desc    Get All Bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getAllBootcamps = catchAsync(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get Single Bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = catchAsync(async (req, res, next) => {
  // 1) Get bootcamp from database
  const bootcamp = await Bootcamp.findById(req.params.id).lean();

  // 2) Check if bootcamp exist
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
  // 1) Add user to req,body
  req.body.user = req.user.id;

  // 2) Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({
    user: req.user.id
  }).lean();

  // 3) If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new AppError(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Update Bootcamp
// @route   PATCH /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = catchAsync(async (req, res, next) => {
  // 1) Get bootcamp from database
  let bootcamp = await Bootcamp.findById(req.params.id).lean();

  // 2) Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 400)
    );
  }

  // 3) Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Delete Bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  // 1) Get bootcamp from database
  const bootcamp = await Bootcamp.findById(req.params.id).lean();

  // 2) Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  // 3) Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  await Bootcamp.deleteOne({ _id: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {}
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = catchAsync(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // 1) Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // 2) Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  }).lean();

  res.status(200).json({
    status: 'success',
    results: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Delete Bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  // 1) Get bootcamp from database
  const bootcamp = await Bootcamp.findById(req.params.id).lean();

  // 2) Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }
  // 3) Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  // 4) Upload photo
  const multerStorage = multer.diskStorage({
    destination: (request, file, cb) => {
      cb(null, process.env.FILE_UPLOAD_PATH);
    },
    filename: (request, file, cb) => {
      //bootcamp-id-currentsTimeTemp.jpeg
      const ext = file.mimetype.split('/')[1];

      cb(null, `bootcamp-${request.params.id}-${Date.now()}.${ext}`);
    }
  });

  const multerFilter = (request, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      request.fileValidationError = 'Only image files are allowed!';
      return cb(
        new AppError('Not an image! Please upload only images.'),
        false
      );
    }

    cb(null, true);
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: process.env.MAX_FILE_UPLOAD }
  }).single('photo');

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
