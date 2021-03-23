const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe);
router.get('/confirmEmail', authController.confirmEmail);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateDetails);
router.delete('/deleteMe', userController.deleteMe);
router.get('/logout', authController.logout);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(APIFeatures(User), userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
