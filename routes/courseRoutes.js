const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.addCourse);

router
  .route('/:id')
  .get(courseController.getCourse)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
