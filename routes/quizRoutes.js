const express = require('express');
const authController = require('../controllers/authController')
const Quiz = require('../models/quizModel');
const router = express.Router();

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    console.log(req.user)
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Admins Only' });
  }
};

router.get('/quiz-test',authController.isAdmin, async (req, res) => {
    return res.status(400).json({message:"Route is working"})
})

// Route to create a new quiz
router.post('/create-quiz', authController.isAdmin, async (req, res) => {
  try {
    const { title, type, questions } = req.body;

    // Validate input
    if (!title || !type || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid input data: Title, type, and questions are required.' });
    }

    // Validate quiz type
    if (!['mcq', 'written', 'mixed'].includes(type)) {
      return res.status(400).json({ message: 'Invalid quiz type. Valid types are mcq, written, or mixed.' });
    }

    // Validate each question based on type
    for (const question of questions) {
      if (!question.text || !question.type) {
        return res.status(400).json({ message: 'Each question must have text and type.' });
      }
      if (!['mcq', 'written'].includes(question.type)) {
        return res.status(400).json({ message: 'Invalid question type. Valid types are mcq or written.' });
      }
      if (question.type === 'mcq') {
        if (!Array.isArray(question.options) || question.options.length < 2 || !question.correctAnswer) {
          return res.status(400).json({
            message: 'MCQ questions must have at least two options and a correct answer.',
          });
        }
      }
      if (question.type === 'written') {
        if (question.options && question.options.length > 0) {
          return res.status(400).json({ message: 'Written questions cannot have options.' });
        }
      }
    }

    // Create a new quiz document
    const newQuiz = new Quiz({
      title,
      type,
      questions,
      createdBy: req.user._id, // Assuming `req.user` contains the authenticated user's details
    });

    // Save the quiz to the database
    const savedQuiz = await newQuiz.save();

    res.status(201).json({ message: 'Quiz created successfully!', quiz: savedQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz', error });
  }
});

module.exports = router;
