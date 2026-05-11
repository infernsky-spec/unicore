const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const User = require('../models/User');
const { FeeBill } = require('../models/Fees');
const { AttendanceSummary } = require('../models/Attendance');

const verifyChildLink = async (parentId, childId) => {
  const parent = await User.findById(parentId);
  return parent?.parentInfo?.linkedStudents?.some(s => s.toString() === childId.toString());
};

router.get('/my-children', protect, authorise('parent'), async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate({ path:'parentInfo.linkedStudents', populate:[
      { path:'studentInfo.programme', select:'name code' }, { path:'studentInfo.department', select:'name code' }
    ]});
    return res.json({ success:true, data:(parent.parentInfo?.linkedStudents||[]).map(s=>s.toPublicJSON()) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/children/:childId/fees', protect, authorise('parent'), async (req, res) => {
  try {
    const ok = await verifyChildLink(req.user._id, req.params.childId);
    if (!ok) return res.status(403).json({ success:false, message:'Not authorised.' });
    const bills = await FeeBill.find({ student:req.params.childId }).populate('semester','name academicYear').sort({ createdAt:-1 });
    return res.json({ success:true, data:bills });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/children/:childId/attendance', protect, authorise('parent'), async (req, res) => {
  try {
    const ok = await verifyChildLink(req.user._id, req.params.childId);
    if (!ok) return res.status(403).json({ success:false, message:'Not authorised.' });
    const data = await AttendanceSummary.find({ student:req.params.childId }).populate('course','title code').populate('semester','name');
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
