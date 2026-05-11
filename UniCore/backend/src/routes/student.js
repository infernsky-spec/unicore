const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/', protect, authorise('admin','teacher'), async (req, res) => {
  try {
    const User = req.db.User;
    const { search, level, programmeId, departmentId, page=1, limit=20 } = req.query;
    const q = { role:{ $in:['student','course_rep'] }, isActive:true };
    if (level)       q['studentInfo.level']      = parseInt(level);
    if (programmeId) q['studentInfo.programme']  = programmeId;
    if (departmentId)q['studentInfo.department'] = departmentId;
    if (search) q.$or = [
      { firstName:{$regex:search,$options:'i'} },{ lastName:{$regex:search,$options:'i'} },
      { email:{$regex:search,$options:'i'} },{ 'studentInfo.indexNumber':{$regex:search,$options:'i'} }
    ];
    const students = await User.find(q)
      .populate('studentInfo.programme','name code degreeType').populate('studentInfo.department','name code')
      .sort({ 'studentInfo.indexNumber':1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await User.countDocuments(q);
    return res.json({ success:true, data:students.map(s=>s.toPublicJSON()), total, pages:Math.ceil(total/limit) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const User = req.db.User;
    if ((req.user.role==='student'||req.user.role==='course_rep') && req.user._id.toString()!==req.params.id)
      return res.status(403).json({ success:false, message:'Access denied.' });
    const s = await User.findOne({ _id: req.params.id })
      .populate('studentInfo.programme','name code degreeType duration')
      .populate('studentInfo.department','name code').populate('studentInfo.faculty','name code')
      .populate('studentInfo.parent','firstName lastName email phone');
    if (!s) return res.status(404).json({ success:false, message:'Student not found.' });
    return res.json({ success:true, data:s.toPublicJSON() });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id/courses', protect, async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const courses = await Course.find({ enrolledStudents:req.params.id, isActive:true })
      .populate('primaryTeacher','firstName lastName email teacherInfo.rank').populate('teachers','firstName lastName').populate('department','name code');
    return res.json({ success:true, data:courses });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
