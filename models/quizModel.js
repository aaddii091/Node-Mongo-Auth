const mongoose = require('mongoose');

// Define a schema for questions (MCQ and Written)
const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // The question text
  options: [{ type: String }], // Options for MCQ (empty for written questions)
  correctAnswer: { type: String }, // Correct option for MCQ or written answer (optional for written)
});

// Define the schema for a quiz
const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the quiz
  type: {
    type: String,
    enum: ['mcq', 'written', 'mixed', 'poll'],
    required: true,
  }, // Type of quiz
  questions: [QuestionSchema], // Array of questions
  defaultOptions: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created the quiz
});

module.exports = mongoose.model('Quiz', QuizSchema);
