const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
exports.login = catchAsync((req, res, next) => {});
exports.signUp = catchAsync(async (req, res, next) => {
  await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // Send a success response
  res.status(200).json({
    status: 'success',
    data: {}, // You can include any additional data here
  });
});
