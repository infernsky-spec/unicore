const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Premium Status
  isPremium: { type: Boolean, default: false },
  premiumTier: { type: String, enum: ['basic', 'premium', 'pro'], default: 'basic' },
  
  // Billing Period
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  monthlyPrice: { type: Number, default: 900 }, // 900 GHS per month
  
  // Dates
  startDate: { type: Date, default: Date.now },
  expiryDate: Date,
  renewalDate: Date,
  
  // Status
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'late', 'grace_period'], default: 'active' },
  lastPaymentDate: Date,
  nextPaymentDue: Date,
  
  // Late Payment Tracking
  isLate: { type: Boolean, default: false },
  lateSince: Date,
  gracePeriodEndsAt: Date,
  
  // Features (for tiering)
  features: {
    unlimitedCourseAccess: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
  },
  
  // Payment History
  lastPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  autoRenew: { type: Boolean, default: true },
  
  // Creator (Frank) Access
  isCreator: { type: Boolean, default: false }, // Frank gets free premium access
  
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Determine status based on dates
  const now = new Date();
  
  if (this.isCreator) {
    this.status = 'active';
    this.isPremium = true;
  } else if (this.expiryDate < now) {
    this.status = 'expired';
    this.isPremium = false;
  } else if (this.isLate && this.gracePeriodEndsAt && this.gracePeriodEndsAt > now) {
    this.status = 'grace_period';
  } else if (this.isLate && (!this.gracePeriodEndsAt || this.gracePeriodEndsAt <= now)) {
    this.status = 'late';
    this.isPremium = false;
  } else {
    this.status = 'active';
    this.isPremium = true;
  }
  
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
