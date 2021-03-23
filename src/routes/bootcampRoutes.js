const express = require('express');
const bootcampController = require('../controllers/bootcampController');
const authController = require('../controllers/authController');
const APIFeatures = require('../utils/apiFeatures');
const Bootcamp = require('../models/bootcampModel');

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courseRoutes');
const reviewRouter = require('./reviewRoutes');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/radius/:zipcode/:distance')
  .get(bootcampController.getBootcampsInRadius);

router
  .route('/:id/photo')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampController.bootcampPhotoUpload
  );

router
  .route('/')
  .get(APIFeatures(Bootcamp, 'courses'), bootcampController.getAllBootcamps)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampController.createBootcamp
  );

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampController.updateBootcamp
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampController.deleteBootcamp
  );

module.exports = router;
