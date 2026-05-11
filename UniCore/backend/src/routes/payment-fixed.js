const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const AdminKey = require('../models/AdminKey');
const crypto = require('crypto');

// Get payment history
router.get('/', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');
    return res.json({ success: true, data: payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Initiate payment
router.post('/initiate', protect, async (req, res) => {
  try {
    const { amount, phoneNumber, type = 'subscription', subscriptionPlan = 'premium', billingPeriod = 'monthly' } = req.body;
    
    if (!amount || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Amount and phone number required' });
    }

    const transactionRef = `EDB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      user: req.user._id,
      type,
      amount,
      phoneNumber,
      subscriptionPlan,
      billingPeriod,
      transactionRef,
      paymentMethod: 'momo',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment initiated. Send GHS ' + amount + ' to 0536716556 (FRANK DARKO) with reference: ' + transactionRef,
      instructions: {
        recipient: 'FRANK DARKO',
        phone: '0536716556',
        amount,
        reference: transactionRef,
        note: 'EduBridge Premium Subscription',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment (admin confirms receipt)
router.post('/:paymentId/verify', protect, authorise('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('user');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already verified' });
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.manualApprovedBy = req.user._id;
    await payment.save();

    // Generate admin private key if admin premium
    if (payment.type === 'admin_premium') {
      const key = crypto.randomBytes(16).toString('hex').toUpperCase();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      const adminKey = await AdminKey.findOneAndUpdate(
        { user: payment.user._id },
        { 
          key,
          expires,
          isActive: true
        },
        { upsert: true, new: true }
      );

      return res.json({
        success: true,
        message: 'Payment verified! Admin private key generated.',
        data: { payment, adminKey },
        privateKey: key  // Show in response for testing
      });
    }

    return res.json({ success: true, message: 'Payment verified.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get current subscription
router.get('/subscription/current', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id }).populate('lastPayment');

    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user._id,
        isPremium: false,
        premiumTier: 'basic',
        status: 'active',
      });
    }

    return res.json({ success: true, data: subscription });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

