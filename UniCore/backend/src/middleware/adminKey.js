const AdminKey = require('../models/AdminKey');

// Middleware to validate admin private key
const validateAdminKey = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }

    const adminKey = await AdminKey.findOne({ 
      user: req.user._id, 
      isActive: true,
      expires: { $gt: new Date() }
    });

    if (!adminKey) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired admin key. Activation required.',
        requiresKey: true 
      });
    }

    req.adminKey = adminKey;
    next();
  } catch (err) {
    console.error('Admin key validation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = validateAdminKey;

