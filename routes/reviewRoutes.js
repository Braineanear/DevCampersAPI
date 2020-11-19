const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/reviewModel');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    APIFeatures(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    reviewController.getReviews
  )
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.addReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
