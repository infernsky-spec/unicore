const express = require('express');
const router  = express.Router();
const { login, adminLogin, register, googleAuth, refreshToken, getMe, changePassword, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.post('/login',           universityMiddleware, login);
router.post('/admin-login',      universityMiddleware, adminLogin);
router.post('/register',        universityMiddleware, register);
router.post('/google',          googleAuth);
router.post('/refresh',         universityMiddleware, refreshToken);
router.post('/logout', protect, universityMiddleware, logout);
router.get('/me',      protect, getMe);
router.put('/change-password', protect, universityMiddleware, changePassword);
router.put('/profile', protect, universityMiddleware, updateProfile);

module.exports = router;
