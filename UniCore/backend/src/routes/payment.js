const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
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

    const transactionRef = `EB-ADM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    const payment = await Payment.create({
      user: req.user._id,
      type: 'admin_premium',
      amount,
      phoneNumber,
      subscriptionPlan: 'admin_premium',
      billingPeriod,
      transactionRef,
      paymentMethod: 'momo',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      data: payment,
      instructions: {
        recipient: 'FRANK DARKO',
        phone: '0536716556',
        amount,
        reference: transactionRef,
        note: 'EduBridge Admin Premium - ' + transactionRef
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
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

    // TODO: Integrate with actual Mobile Money API
    // For now, return pending with instructions
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

    // Generate admin private key and email it
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
    ).populate('user');

    // Email key
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"EduBridge Admin" <no-reply@edubridge.com>',
      to: adminKey.user.email,
      subject: '✅ Admin Access Granted - Private Key',
      html: `
        <h2>🎓 Admin Access Activated!</h2>
        <p>Payment <strong>${payment.transactionRef}</strong> verified.</p>
        <hr>
        <div style="background:#1e293b;color:#fff;padding:25px;border-radius:10px;font-family:monospace;font-size:20px;letter-spacing:3px;text-align:center;margin:25px 0;font-weight:bold;">
          ${key}
        </div>
        <p><strong>Valid until:</strong> ${adminKey.expires.toLocaleDateString('en-GH')}</p>
        <p>Login → Admin Portal → Enter this key → Dashboard access granted!</p>
        <hr>
        <p>₵900 Monthly Admin Premium</p>
        <p>Thank you for choosing <strong>EduBridge</strong>!</p>
      `
    });

    return res.json({
      success: true,
      message: 'Payment verified! Admin private key generated & emailed.',
      data: { payment, adminKey }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.manualApprovedBy = req.user._id;
    payment.manualApprovedAt = new Date();
    await payment.save();

    // Create or update subscription
    let subscription = await Subscription.findOne({ user: payment.user });
    if (!subscription) {
      const expiryDate = new Date();
      if (payment.billingPeriod === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
      else if (payment.billingPeriod === 'quarterly') expiryDate.setMonth(expiryDate.getMonth() + 3);
      else expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      subscription = await Subscription.create({
        user: payment.user,
        isPremium: true,
        premiumTier: 'premium',
        billingCycle: payment.billingPeriod,
        startDate: new Date(),
        expiryDate,
        renewalDate: expiryDate,
        status: 'active',
        lastPaymentDate: new Date(),
        nextPaymentDue: expiryDate,
        lastPayment: payment._id,
      });
    } else {
      // Extend existing subscription
      const extendDays = payment.billingPeriod === 'monthly' ? 30 : payment.billingPeriod === 'quarterly' ? 90 : 365;
      const newExpiryDate = new Date(subscription.expiryDate);
      newExpiryDate.setDate(newExpiryDate.getDate() + extendDays);

      subscription.expiryDate = newExpiryDate;
      subscription.renewalDate = newExpiryDate;
      subscription.status = 'active';
      subscription.isPremium = true;
      subscription.isLate = false;
      subscription.lastPaymentDate = new Date();
      subscription.nextPaymentDue = newExpiryDate;
      subscription.lastPayment = payment._id;
      await subscription.save();
    }

    return res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: { payment, subscription },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get current subscription
router.get('/subscription/current', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id }).populate('lastPayment');

    // If no subscription exists, create a default free one
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

// Mark subscription as late (automated, runs daily)
router.post('/subscription/check-expiry', async (req, res) => {
  try {
    const now = new Date();
    const gracePeriodDays = 7;

    // Find expired subscriptions
    const expiredSubs = await Subscription.find({
      expiryDate: { $lte: now },
      status: { $ne: 'cancelled' },
      isCreator: false,
    });

    for (const sub of expiredSubs) {
      const daysSinceExpiry = Math.floor((now - sub.expiryDate) / (1000 * 60 * 60 * 24));

      if (daysSinceExpiry > gracePeriodDays) {
        sub.status = 'late';
        sub.isPremium = false;
      } else {
        sub.status = 'grace_period';
        sub.isLate = true;
        sub.lateSince = sub.expiryDate;
        sub.gracePeriodEndsAt = new Date(sub.expiryDate.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
      }
      await sub.save();
    }

    return res.json({ success: true, message: 'Expiry check completed', processed: expiredSubs.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create creator access for Frank (manual setup)
router.post('/creator-access/:userId', protect, authorise('admin'), async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.params.userId });

    if (!subscription) {
      subscription = await Subscription.create({
        user: req.params.userId,
        isCreator: true,
        isPremium: true,
        premiumTier: 'premium',
        status: 'active',
        startDate: new Date(),
        expiryDate: new Date('2099-12-31'), // Permanent
      });
    } else {
      subscription.isCreator = true;
      subscription.isPremium = true;
      subscription.status = 'active';
      subscription.expiryDate = new Date('2099-12-31');
      await subscription.save();
    }

    return res.json({ success: true, message: 'Creator access granted', data: subscription });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
