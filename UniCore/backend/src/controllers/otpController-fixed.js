const jwt = require('jsonwebtoken');
const User = require('../models/User');
const twilio = require('twilio');
const crypto = require('crypto');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user (create if not exist)
    const user = await User.findOneAndUpdate(
      { phone: phone.trim() },
      { 
        phone: phone.trim(),
        otpToken: otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 min
      },
      { upsert: true, new: true }
    );

    // Send SMS
    await client.messages.create({
      body: `EduBridge OTP: ${otp}. Valid for 10 minutes. Do not share.`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    res.json({ success: true, message: 'OTP sent to phone' });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ 
      phone: phone.trim(),
      otpToken: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.phoneVerified = true;
    user.otpToken = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token if new user or login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      success: true, 
      message: 'Phone verified', 
      token,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendOTP, verifyOTP };

