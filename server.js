// Required dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://dhinakaran75493:dhinakaran75493@login-register.lkjv8kv.mongodb.net/Login?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB Atlas:', error);
  });

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'enter-email',
    pass: 'your-email-password',
  },
});

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered!' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register user!' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    return res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login!' });
  }
});

// Forgot password route
app.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send password reset email
    const mailOptions = {
      from: 'enter-email',
      to: email,
      subject: 'Password Reset',
      text: 'Your password has been reset successfully.',
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset password!' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
