const express = require('express');
const bootcampController = require('../controllers/bootcampController');

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courseRoutes');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/radius/:zipcode/:distance')
  .get(bootcampController.getBootcampsInRadius);

router.route('/:id/photo').put(bootcampController.bootcampPhotoUpload);

router
  .route('/')
  .get(bootcampController.getAllBootcamps)
  .post(bootcampController.createBootcamp);

router
  .route('/:id')
  .get(bootcampController.getBootcamp)
  .put(bootcampController.updateBootcamp)
  .delete(bootcampController.deleteBootcamp);

module.exports = router;
