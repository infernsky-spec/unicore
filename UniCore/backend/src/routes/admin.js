const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const User = require('../models/User');
const { Faculty, Department, Programme } = require('../models/Academic');
const premiumMiddleware = require('../middleware/premium');
const validateAdminKey = require('../middleware/adminKey');
const University = require('../models/University');
const Admission = require('../models/Admission');

const requirePremium = premiumMiddleware.requirePremium;
const adminOnly = [protect, authorise('admin'), validateAdminKey];

router.post('/ai-key', adminOnly, async (req, res) => {
  try {
    const { universityId, anthropicApiKey } = req.body;
    if (!universityId || !anthropicApiKey) {
      return res.status(400).json({ success: false, message: 'University ID and API key required' });
    }
    
    const uni = await University.findById(universityId).select('+anthropicApiKey');
    if (!uni) return res.status(404).json({ success: false, message: 'University not found' });
    
    uni.anthropicApiKey = anthropicApiKey;
    await uni.save();
    
    return res.json({ success: true, message: 'Claude API key updated successfully' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/ai-key/:universityId', adminOnly, async (req, res) => {
  try {
    const uni = await University.findById(req.params.universityId).select('+anthropicApiKey');
    if (!uni) return res.status(404).json({ success: false, message: 'University not found' });
    
    return res.json({ success: true, anthropicApiKey: uni.anthropicApiKey ? '***CONFIGURED***' : null });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { role, isActive, search, page =1, limit=20 } = req.query;
    const q = { university: req.user.university };
    if (role) q.role = role;
    if (isActive !== undefined) q.isActive = isActive === 'true';
    if (search) q.$or = [
      { firstName:{ $regex:search, $options:'i' } },
      { lastName:{ $regex:search, $options:'i' } },
      { email:{ $regex:search, $options:'i' } },
      { userId:{ $regex:search, $options:'i' } },
      { 'studentInfo.indexNumber':{ $regex:search, $options:'i' } }
    ];
    const users = await User.find(q)
      .populate('studentInfo.programme', 'name code')
      .populate('studentInfo.department', 'name code')
      .populate('teacherInfo.department', 'name code')
      .populate('parentInfo.linkedStudents', 'firstName lastName studentInfo.indexNumber')
      .sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await User.countDocuments(q);
    return res.json({ success: true, data: users, total, pages: Math.ceil(total/limit) });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/users', adminOnly, async (req, res) => {
  try {
    const u = await User.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, message: 'User created.', user: u });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.get('/users/:id', adminOnly, async (req, res) => {
  try {
    const u = await User.findOne({ _id: req.params.id, university: req.user.university });
    if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: u });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const u = await User.findOneAndUpdate(
      { _id: req.params.id, university: req.user.university }, 
      req.body, 
      { new:true, runValidators:true }
    );
    if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User updated.', user: u });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/users/:id/toggle-active', adminOnly, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
    await User.updateOne({ _id: u._id }, { $set: { isActive: !u.isActive } });
    return res.json({ success: true, message: `User ${!u.isActive ? 'activated' : 'deactivated'}.`, isActive: !u.isActive });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// Faculties
router.get('/faculties', adminOnly, async (req, res) => {
  try {
    const data = await Faculty.find({ university: req.user.university });
    return res.json({ success: true, data });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/faculties', adminOnly, async (req, res) => {
  try {
    const d = await Faculty.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.put('/faculties/:id', adminOnly, async (req, res) => {
  try {
    const d = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new:true });
    return res.json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// Departments
router.get('/departments', protect, async (req, res) => {
  try {
    const data = await Department.find({ university: req.user.university });
    return res.json({ success: true, data });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/departments', adminOnly, async (req, res) => {
  try {
    const d = await Department.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.put('/departments/:id', adminOnly, async (req, res) => {
  try {
    const d = await Department.findByIdAndUpdate(req.params.id, req.body, { new:true });
    return res.json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// Programmes
router.get('/programmes', protect, async (req, res) => {
  try {
    const data = await Programme.find({ university: req.user.university });
    return res.json({ success: true, data });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/programmes', adminOnly, async (req, res) => {
  try {
    const d = await Programme.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.put('/programmes/:id', adminOnly, async (req, res) => {
  try {
    const d = await Programme.findByIdAndUpdate(req.params.id, req.body, { new:true });
    return res.json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

// Admissions
router.get('/admissions', adminOnly, async (req, res) => {
  try {
    const data = await Admission.find({ university: req.user.university }).sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/admissions', adminOnly, async (req, res) => {
  try {
    const { indexNumber } = req.body;
    const existing = await Admission.findOne({ indexNumber, university: req.user.university });
    if (existing) return res.status(400).json({ success: false, message: 'Index number already exists' });
    
    const d = await Admission.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/admissions/:id', adminOnly, async (req, res) => {
  try {
    await Admission.findOneAndDelete({ _id: req.params.id, university: req.user.university });
    return res.json({ success: true, message: 'Record deleted' });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

const StaffVerification = require('../models/StaffVerification');

// Staff Verification Management
router.get('/staff-verification', adminOnly, async (req, res) => {
  try {
    const data = await StaffVerification.find({ university: req.user.university }).sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/staff-verification', adminOnly, async (req, res) => {
  try {
    const { idNumber } = req.body;
    const existing = await StaffVerification.findOne({ idNumber, university: req.user.university });
    if (existing) return res.status(400).json({ success: false, message: 'Staff ID number already exists' });
    
    const d = await StaffVerification.create({ ...req.body, university: req.user.university });
    return res.status(201).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/staff-verification/:id', adminOnly, async (req, res) => {
  try {
    await StaffVerification.findOneAndDelete({ _id: req.params.id, university: req.user.university });
    return res.json({ success: true, message: 'Staff record deleted' });
  } catch(e) { return res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

