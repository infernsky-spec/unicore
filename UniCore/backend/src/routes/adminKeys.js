const express = require('express');
const router = express.Router();
const { protect, authorise } = require('../middleware/auth');
const AdminKey = require('../models/AdminKey');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post('/generate', protect, async (req, res) => {
  try {
    const { userId, expiresInDays = 30 } = req.body;

    // Generate unique private key
    const key = crypto.randomBytes(16).toString('hex').toUpperCase();

    const expires = new Date();
    expires.setDate(expires.getDate() + expiresInDays);

    const adminKey = await AdminKey.findOneAndUpdate(
      { user: userId },
      { 
        key,
        expires,
        isActive: true
      },
      { new: true, upsert: true }
    ).populate('user', 'email firstName lastName');

    // Email private key
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
      subject: 'Your Admin Private Key - EduBridge',
      html: `
        <h2>🎓 EduBridge Admin Private Key</h2>
        <p>Dear <strong>${adminKey.user.firstName} ${adminKey.user.lastName}</strong>,</p>
        <p>Your monthly admin access key:</p>
        <div style="background: #1e293b; color: white; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 20px 0;">
          ${key}
        </div>
        <p><strong>Valid until:</strong> ${adminKey.expires.toLocaleDateString()}</p>
        <p><em>Login → Admin → Enter this key to access dashboard</em></p>
        <hr>
        <p>Need renewal? Complete payment and request new key.</p>
        <p>Thank you for choosing EduBridge!</p>
      `
    });

    return res.json({ 
      success: true, 
      message: 'Admin key generated and emailed',
      data: { key, expires: adminKey.expires }
    });
  } catch (err) {
    console.error('Admin key generation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/validate/:key', protect, async (req, res) => {
  try {
    const adminKey = await AdminKey.findOne({ 
      key: req.params.key.toUpperCase(),
      isActive: true,
      expires: { $gt: new Date() },
      user: req.user._id 
    });

    if (!adminKey) {
      return res.status(403).json({ success: false, message: 'Invalid or expired key' });
    }

    return res.json({ 
      success: true, 
      message: 'Valid admin key',
      data: adminKey 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

