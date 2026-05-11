const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const { Course } = require('../models/Academic');
const User = require('../models/User');

// GET /api/registration/available - courses available for student to register
router.get('/available', protect, authorise('student','course_rep'), async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    const user = req.user;
    const level = user.studentInfo?.level || 100;
    const dept  = user.studentInfo?.department;
    const prog  = user.studentInfo?.programme;

    const query = { isActive: true };
    if (level) query.level = level;
    // In many cases we want courses for specific dept/prog
    if (dept)  query.$or = [{ department: dept }, { programme: prog }];

    const courses = await Course.find(query)
      .populate('primaryTeacher', 'firstName lastName teacherInfo.rank')
      .populate('department', 'name code')
      .sort({ code: 1 });

    const registeredIds = (user.studentInfo?.registeredCourses || []).map(id => id.toString());
    const enriched = courses.map(c => ({
      ...c.toObject(),
      isRegistered: registeredIds.includes(c._id.toString()),
      spotsLeft: (c.capacity || 200) - (c.enrolledStudents?.length || 0)
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registration/register - student registers for a course
router.post('/register', protect, authorise('student','course_rep'), async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isActive) return res.status(400).json({ success: false, message: 'Course is not active.' });

    const enrolled = course.enrolledStudents?.length || 0;
    if (enrolled >= (course.capacity || 200)) return res.status(400).json({ success: false, message: 'Course is full.' });

    const already = (req.user.studentInfo?.registeredCourses || []).some(id => id.toString() === courseId);
    if (already) return res.status(400).json({ success: false, message: 'Already registered for this course.' });

    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { 'studentInfo.registeredCourses': courseId } });

    return res.json({ success: true, message: `Successfully registered for ${course.title}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/registration/drop/:courseId
router.delete('/drop/:courseId', protect, authorise('student','course_rep'), async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    await Course.findByIdAndUpdate(req.params.courseId, { $pull: { enrolledStudents: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { 'studentInfo.registeredCourses': req.params.courseId } });
    return res.json({ success: true, message: 'Course dropped successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/registration/my - student's registered courses
router.get('/my', protect, async (req, res) => {
  try {
    const User = req.db.User;
    const user = await User.findById(req.user._id).populate({
      path: 'studentInfo.registeredCourses',
      populate: [{ path:'primaryTeacher', select:'firstName lastName' }, { path:'department', select:'name code' }]
    });
    return res.json({ success: true, data: user.studentInfo?.registeredCourses || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registration/teacher-register - teacher adds course to their list
router.post('/teacher-register', protect, authorise('teacher'), async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    await Course.findByIdAndUpdate(courseId, { $addToSet: { teachers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { 'teacherInfo.courses': courseId } });

    return res.json({ success: true, message: `Registered as teacher for ${course.title}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
