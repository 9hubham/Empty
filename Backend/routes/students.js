const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await User.find({}).select('-password');
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Process payment
router.post('/payment', auth, async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv } = req.body;
    
    // Simulate payment processing
    const paymentDetails = {
      cardNumber: cardNumber.slice(-4), // Only store last 4 digits
      expiryDate,
      cvv: '***', // Don't store actual CVV
      paymentDate: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        feesPaid: true,
        paymentDetails
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
