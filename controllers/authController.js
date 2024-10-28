const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const mongoose = require('mongoose');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt received:', { email: req.body.email });

    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide username and password'
      });
    }

    // Ensure we're connected to the database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: true
      });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log('Invalid credentials');
      return res.status(401).json({
        status: 'fail',
        message: 'User or Password is Wrong'
      });
    }

    const token = signToken(user._id);
    console.log('Login successful for:', email);

    res.status(200).json({
      status: 'success',
      message: 'Logged In Successfully',
      token: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    console.log('Signup attempt:', { email: req.body.email });

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);
    console.log('Signup successful for:', req.body.email);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        },
        token: token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist')
    );
  }

  req.user = freshUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 401));
  }
  const resetToken = await user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password & passwordConfirm to: ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to mail',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is expired or invalid', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //geting user from collection
  const user = await User.findById(req.user._id.toString()).select('+password');
  //checking if the current password is correct
  if (user.correctPassword(user.password, req.body.password)) {
    console.log('correct password');
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'Logged In Successfully',
    token: token,
  });
});
