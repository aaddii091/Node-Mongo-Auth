// IMPORTS

const app = require('./index');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//config for .env

dotenv.config({ path: './config.env' });

// Wrap mongoose connection in a try-catch
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('DB connection successful!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in production
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export the app for Vercel
module.exports = app;
