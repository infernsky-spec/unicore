const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/', protect, async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const { level, semester, departmentId, search, page=1, limit=20 } = req.query;
    const q = { isActive: true, university: req.universityId };
    if (level)       q.level      = parseInt(level);
    if (semester)    q.semester   = parseInt(semester);
    if (departmentId)q.department = departmentId;
    if (search)      q.$or = [{ title:{ $regex:search,$options:'i' } },{ code:{ $regex:search,$options:'i' } }];
    const courses = await Course.find(q)
      .populate('teachers','firstName lastName teacherInfo.rank')
      .populate('primaryTeacher','firstName lastName')
      .populate('department','name code')
      .populate('courseRep','firstName lastName studentInfo.indexNumber')
      .sort({ code:1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await Course.countDocuments(q);
    return res.json({ success:true, data:courses, total, pages:Math.ceil(total/limit) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/my/courses', protect, async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    let courses;
    if (req.user.role==='student'||req.user.role==='course_rep') {
      const u = await User.findById(req.user._id).populate({ path:'studentInfo.registeredCourses', populate:[{path:'primaryTeacher',select:'firstName lastName email'},{path:'teachers',select:'firstName lastName'},{path:'department',select:'name code'}] });
      courses = u?.studentInfo?.registeredCourses || [];
    } else if (req.user.role==='teacher') {
      courses = await Course.find({ teachers:req.user._id, isActive:true, university: req.universityId })
        .populate('enrolledStudents','firstName lastName studentInfo.indexNumber')
        .populate('department','name code');
    } else {
      courses = await Course.find({ isActive:true, university: req.universityId }).populate('primaryTeacher','firstName lastName');
    }
    return res.json({ success:true, data:courses });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const c = await Course.findOne({ _id: req.params.id, university: req.universityId })
      .populate('teachers','firstName lastName email teacherInfo.rank teacherInfo.officeLocation')
      .populate('primaryTeacher','firstName lastName email phone')
      .populate('department','name code').populate('faculty','name code')
      .populate('courseRep','firstName lastName studentInfo.indexNumber phone')
      .populate('enrolledStudents','firstName lastName studentInfo.indexNumber studentInfo.level');
    if (!c) return res.status(404).json({ success:false, message:'Course not found.' });
    return res.json({ success:true, data:c });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', protect, authorise('admin'), async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const c = await Course.create({ ...req.body, university: req.universityId });
    return res.status(201).json({ success:true, data:c });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.put('/:id', protect, authorise('admin','teacher'), async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const c = await Course.findOneAndUpdate({ _id: req.params.id, university: req.universityId }, req.body, { new:true, runValidators:true });
    if (!c) return res.status(404).json({ success:false, message:'Course not found.' });
    return res.json({ success:true, data:c });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/enroll', protect, authorise('admin'), async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const User = req.db.User;
    const { studentId } = req.body;
    const c = await Course.findOneAndUpdate({ _id: req.params.id, university: req.universityId }, { $addToSet:{ enrolledStudents:studentId } }, { new:true });
    if (!c) return res.status(404).json({ success: false, message: 'Course not found' });
    await User.findOneAndUpdate({ _id: studentId, university: req.universityId }, { $addToSet:{ 'studentInfo.registeredCourses':req.params.id } });
    return res.json({ success:true, message:'Student enrolled.', enrolledCount:c.enrolledStudents.length });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id/enroll/:studentId', protect, authorise('admin'), async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const User = req.db.User;
    await Course.findByIdAndUpdate(req.params.id, { $pull:{ enrolledStudents:req.params.studentId } });
    await User.findByIdAndUpdate(req.params.studentId, { $pull:{ 'studentInfo.registeredCourses':req.params.id } });
    return res.json({ success:true, message:'Student unenrolled.' });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/teachers', protect, authorise('admin'), async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const User = req.db.User;
    const { teacherId, isPrimary } = req.body;
    const update = { $addToSet:{ teachers:teacherId } };
    if (isPrimary) update.primaryTeacher = teacherId;
    const c = await Course.findByIdAndUpdate(req.params.id, update, { new:true });
    await User.findByIdAndUpdate(teacherId, { $addToSet:{ 'teacherInfo.courses':c._id } });
    return res.json({ success:true, message:'Teacher assigned.', data:c });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
