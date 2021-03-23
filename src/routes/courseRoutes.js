const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const APIFeatures = require('../utils/apiFeatures');
const Course = require('../models/courseModel');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    APIFeatures(Course, {
      path: 'bootcamp',
      select: 'name description'
    }),
    courseController.getAllCourses
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.addCourse
  );

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.deleteCourse
  );

module.exports = router;
