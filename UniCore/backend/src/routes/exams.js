const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/', protect, async (req, res) => {
  try {
    const Exam = req.db.model('Exam');
    const { semesterId, courseId, type } = req.query;
    const q = { isPublished:true };
    if (semesterId) q.semester = semesterId;
    if (courseId)   q.course   = courseId;
    if (type)       q.type     = type;
    const data = await Exam.find(q).populate('course','title code level').populate('chiefInvigilator','firstName lastName email').populate('assistantInvigilators','firstName lastName').populate('semester','name academicYear').sort({ date:1 });
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/my-timetable', protect, async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    const Exam = req.db.model('Exam');
    const user    = await User.findById(req.user._id);
    const regIds  = user.studentInfo?.registeredCourses || [];
    const enrolled= await Course.find({ $or:[{ enrolledStudents:req.user._id }, { _id:{ $in:regIds } }] }).select('_id');
    const ids     = enrolled.map(c=>c._id);
    const q       = { course:{ $in:ids }, isPublished:true };
    if (req.query.semesterId) q.semester = req.query.semesterId;
    const data = await Exam.find(q).populate('course','title code creditHours level').populate('chiefInvigilator','firstName lastName email phone teacherInfo.rank').populate('assistantInvigilators','firstName lastName').sort({ date:1 });
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const Exam = req.db.model('Exam');
    const e = await Exam.findById(req.params.id).populate('course','title code level').populate('chiefInvigilator','firstName lastName email teacherInfo.rank').populate('assistantInvigilators','firstName lastName');
    if (!e) return res.status(404).json({ success:false, message:'Exam not found.' });
    return res.json({ success:true, data:e });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', protect, authorise('admin','teacher'), async (req, res) => {
  try { 
    const Exam = req.db.model('Exam');
    return res.status(201).json({ success:true, data: await Exam.create({ ...req.body, createdBy:req.user._id }) }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.put('/:id', protect, authorise('admin','teacher'), async (req, res) => {
  try {
    const Exam = req.db.model('Exam');
    const e = await Exam.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!e) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:e });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/publish', protect, authorise('admin'), async (req, res) => {
  try {
    const Exam = req.db.model('Exam');
    const e = await Exam.findByIdAndUpdate(req.params.id, { isPublished:req.body.publish, publishedAt:req.body.publish?new Date():null }, { new:true });
    return res.json({ success:true, data:e });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

// Results
router.get('/results/all', protect, authorise('admin', 'teacher'), async (req, res) => {
  try {
    const Result = req.db.model('Result');
    const { courseId, semesterId } = req.query;
    const q = {};
    if (courseId) q.course = courseId;
    if (semesterId) q.semester = semesterId;
    const data = await Result.find(q)
      .populate('student', 'firstName lastName email studentInfo.indexNumber')
      .populate('course', 'title code')
      .populate('semester', 'name academicYear')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.get('/results/my', protect, async (req, res) => {
  try {
    const Result = req.db.model('Result');
    const data = await Result.find({ student:req.user._id, isPublished:true }).populate('course','title code creditHours').populate('semester','name academicYear').sort({ createdAt:-1 });
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/results', protect, authorise('teacher','admin'), async (req, res) => {
  try {
    const Result = req.db.model('Result');
    const { results } = req.body;
    const saved = [];
    for (const r of results) {
      let doc = await Result.findOne({ 
        student: r.student, 
        course: r.course, 
        semester: r.semester
      });

      if (doc) {
        Object.assign(doc, r);
        doc.uploadedBy = req.user._id;
        doc.isPublished = true;
      } else {
        doc = new Result({
          ...r,
          uploadedBy: req.user._id,
          isPublished: true,
          university: req.universityId
        });
      }
      await doc.save();
      saved.push(doc);
    }
    return res.json({ success:true, message:`${saved.length} results saved.`, data:saved });
  } catch(e){ 
    console.error('Result save error:', e);
    return res.status(500).json({ success:false, message:e.message }); 
  }
});

router.patch('/results/publish', protect, authorise('admin'), async (req, res) => {
  try {
    const Result = req.db.model('Result');
    const { courseId, semesterId } = req.body;
    const updated = await Result.updateMany({ course:courseId, semester:semesterId }, { isPublished:true, publishedAt:new Date() });
    return res.json({ success:true, message:`${updated.modifiedCount} results published.` });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
