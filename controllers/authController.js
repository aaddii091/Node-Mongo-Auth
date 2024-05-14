const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
exports.login = catchAsync((req, res, next) => {});
exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send a success response
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser, // Include the newly created user in the response
    },
  });
});
