const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  feesPaid: {
    type: Boolean,
    default: false
  },
  paymentDetails: {
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    paymentDate: Date
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
module.exports = User;