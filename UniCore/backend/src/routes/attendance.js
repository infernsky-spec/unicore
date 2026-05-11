const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const { createSession, markAttendance, closeSession, getCourseAttendance, getStudentAttendance, getSessionRecords, getActiveSessions } = require('../controllers/attendanceController');
const universityMiddleware = require('../middleware/university');

router.post('/sessions',                    protect, universityMiddleware, authorise('teacher','course_rep','admin'), createSession);
router.post('/sessions/:sessionId/close',   protect, authorise('teacher','course_rep','admin'), closeSession);
router.get('/sessions/:sessionId/records',  protect, authorise('teacher','admin'),              getSessionRecords);
router.get('/active-sessions',              protect, universityMiddleware,                  getActiveSessions);
router.post('/mark',                        protect, authorise('student','course_rep'),         markAttendance);
router.get('/courses/:courseId',            protect, authorise('teacher','admin'),              getCourseAttendance);
router.get('/student',                      protect,                                            getStudentAttendance);
router.get('/student/:studentId',           protect, authorise('teacher','admin','parent'),     getStudentAttendance);

module.exports = router;
