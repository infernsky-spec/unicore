const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['subscription', 'fee', 'other'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'GHS' },
  
  // Subscription Payment Details
  subscriptionPlan: { type: String, enum: ['premium', 'basic'], default: 'premium' },
  billingPeriod: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  
  // Payment Method (Mobile Money)
  paymentMethod: { type: String, enum: ['momo', 'card', 'bank'], default: 'momo' },
  phoneNumber: String,
  transactionRef: { type: String, unique: true, sparse: true },
  
  // Payment Status
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'], default: 'pending' },
  completedAt: Date,
  failureReason: String,
  
  // Verification
  verificationToken: String,
  verifiedAt: Date,
  manualApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manualApprovedAt: Date,
  
  // Notes
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
