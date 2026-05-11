const Subscription = require('../models/Subscription');

// Middleware to check if user has premium access
const checkPremium = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      // Create default subscription if doesn't exist
      await Subscription.create({
        user: req.user._id,
        isPremium: false,
        premiumTier: 'basic',
        status: 'active',
      });
    }

    req.userSubscription = subscription;
    next();
  } catch (err) {
    console.error('Premium check error:', err);
    next();
  }
};

// Middleware to enforce premium access

const requirePremium = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });

    // Allow admin role to bypass premium check
    if (req.user.role === 'admin') {
      req.userSubscription = subscription || { isPremium: false, status: 'active' };
      return next();
    }

    if (!subscription || (!subscription.isPremium && !subscription.isCreator)) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this feature',
        requiresUpgrade: true,
      });
    }

    if (subscription.status === 'late') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        status: 'late',
      });
    }

    req.userSubscription = subscription;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = { checkPremium, requirePremium };
