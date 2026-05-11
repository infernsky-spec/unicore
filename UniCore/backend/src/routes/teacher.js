const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const User = require('../models/User');

const universityMiddleware = require('../middleware/university');

router.get('/', universityMiddleware, async (req, res) => {
  try {
    const { search, departmentId, page=1, limit=20 } = req.query;
    const User = req.db.User; // Use tenant User model
    const q = { role:'teacher', isActive:true };
    if (departmentId) q['teacherInfo.department'] = departmentId;
    if (search) q.$or = [{ firstName:{$regex:search,$options:'i'} },{ lastName:{$regex:search,$options:'i'} },{ 'teacherInfo.staffId':{$regex:search,$options:'i'} }];
    const teachers = await User.find(q)
      .populate('teacherInfo.department','name code').populate('teacherInfo.faculty','name code').populate('teacherInfo.courses','title code')
      .sort({ firstName:1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await User.countDocuments(q);
    return res.json({ success:true, data:teachers.map(t=>t.toPublicJSON()), total });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', universityMiddleware, async (req, res) => {
  try {
    const User = req.db.User;
    const t = await User.findOne({ _id:req.params.id, role:'teacher' })
      .populate('teacherInfo.department','name code').populate('teacherInfo.faculty','name code').populate('teacherInfo.courses','title code level creditHours');
    if (!t) return res.status(404).json({ success:false, message:'Teacher not found.' });
    return res.json({ success:true, data:t.toPublicJSON() });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
