const express = require('express');
const authController = require('./../controllers/authController');
const router = express();

router.get('/login', (req, res, next) => {
  res.status(200).json({
    message: 'Good',
  });
});

router.post('/signup', authController.signUp);

module.exports = router;
