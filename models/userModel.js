const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['user', 'publisher', 'admin'],
    default: 'user'
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  confirmEmailToken: String,
  isEmailConfirmed: {
    type: Boolean,
    default: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works with CREATE & SAVE!!!!!
      validator: function (el) {
        return el === this.password;
      },
      messege: 'Passwords are not the same'
    }
  },
  twoFactorCode: String,
  twoFactorCodeExpire: Date,
  twoFactorEnable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  // 1) Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // 2) Salt & Hashing Password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // 3) Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

// Set passwordChangedAt field to the current time when the user change the password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // False means not changed
};

// Generate and hash password token
userSchema.methods.createPasswordResetToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email confirm token
userSchema.methods.generateEmailConfirmToken = function (next) {
  // email confirmation token
  const confirmationToken = crypto.randomBytes(20).toString('hex');

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmationToken)
    .digest('hex');

  const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
  return confirmTokenCombined;
};

module.exports = mongoose.model('User', userSchema);
