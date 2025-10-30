const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, index: true },
  appNumber: { type: String },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Optional: add TTL index to remove expired docs automatically (Mongo will delete when expiresAt passed)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
