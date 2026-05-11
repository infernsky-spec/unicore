const { AttendanceSession, AttendanceRecord, AttendanceSummary } = require('../models/Attendance');
const { Course } = require('../models/Academic');
const User = require('../models/User');

const generatePin = () => String(Math.floor(100000 + Math.random() * 900000));

exports.createSession = async (req, res) => {
  try {
    const { AttendanceSession } = req.db;
    const Course = req.db.model('Course');
    const { courseId, semesterId, venue, type, date, startTime, notes } = req.body;
    if (!req.universityId) return res.status(400).json({ success:false, message:'University context required' });
    if (!courseId || !semesterId) return res.status(400).json({ success:false, message:'courseId and semesterId required.' });
    const course = await Course.findOne({ _id: courseId }).populate('enrolledStudents','_id');
    if (!course) return res.status(404).json({ success:false, message:'Course not found.' });
    const isTeacher = course.teachers?.some(t=>t.toString()===req.user._id.toString());
    const isCourseRep = course.courseRep?.toString()===req.user._id.toString();
    if (!isTeacher && !isCourseRep && req.user.role!=='admin')
      return res.status(403).json({ success:false, message:'Not authorised for this course.' });
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const existing = await AttendanceSession.findOne({ 
      course:courseId, 
      date:{ $gte:today, $lt:tomorrow }, 
      status:'open' 
    });
    if (existing) return res.status(400).json({ success:false, message:'An open session already exists for today.', session:existing });
    const pin       = generatePin();
    const expiry    = 7; // 7 minutes as requested
    const session   = await AttendanceSession.create({ 
      course:courseId, 
      university: req.universityId,
      semester:semesterId, 
      sessionPin:pin, 
      pinExpiresAt:new Date(Date.now()+expiry*60000), 
      createdBy:req.user._id, 
      createdByRole:req.user.role, 
      date:date||new Date(), 
      startTime, 
      venue, 
      type:type||'Lecture', 
      notes, 
      totalEnrolled:course.enrolledStudents?.length||0, 
      status:'open' 
    });
    req.app.get('io').to(`course_${courseId}`).emit('session_created', { sessionId:session._id, courseId, pin, expiresAt:session.pinExpiresAt });
    return res.status(201).json({ success:true, message:'Session created. Code expires in 7 mins.', session:{ ...session.toObject(), sessionPin:pin } });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.markAttendance = async (req, res) => {
  try {
    const { AttendanceSession } = req.db;
    const AttendanceRecord = req.db.model('AttendanceRecord');
    const Course = req.db.model('Course');
    const { pin, courseId } = req.body;
    if (!req.universityId) return res.status(400).json({ success:false, message:'University context required' });
    if (!pin || !courseId) return res.status(400).json({ success:false, message:'PIN and courseId required.' });
    const session = await AttendanceSession.findOne({ 
      course:courseId, 
      sessionPin:pin, 
      status:'open' 
    });
    if (!session) return res.status(404).json({ success:false, message:'Invalid PIN or session is closed.' });
    
    if (Date.now() > session.pinExpiresAt.getTime()) {
      await AttendanceSession.updateOne({ _id:session._id },{ status:'expired' });
      return res.status(400).json({ success:false, message:'PIN has expired.' });
    }
    const course = await Course.findOne({ _id:courseId });
    const user   = await req.db.User.findById(req.user._id);
    const regIds = user.studentInfo?.registeredCourses?.map(id=>id.toString())||[];
    const enrolled= course.enrolledStudents?.some(s=>s.toString()===req.user._id.toString());
    const registered = regIds.includes(courseId.toString());
    if (!enrolled && !registered) return res.status(403).json({ success:false, message:'You are not enrolled in this course.' });
    const existing = await AttendanceRecord.findOne({ session:session._id, student:req.user._id });
    if (existing) return res.status(400).json({ success:false, message:'Attendance already marked.' });
    const windowMin  = parseInt(process.env.ATTENDANCE_WINDOW_MINUTES||15);
    const minSince   = Math.floor((Date.now()-session.createdAt)/60000);
    const isLate     = minSince > windowMin;
    const record     = await AttendanceRecord.create({ 
      session:session._id, 
      university: req.universityId,
      student:req.user._id, 
      course:courseId, 
      semester:session.semester, 
      status:isLate?'late':'present', 
      method:'pin', 
      minutesLate:isLate?minSince-windowMin:0, 
      ipAddress:req.ip 
    });
    await AttendanceSession.updateOne({ _id:session._id },{ $inc:{ totalPresent:1 } });
    await updateSummary(req.user._id, courseId, session.semester, req.universityId, req.db);
    req.app.get('io').to(`course_${courseId}`).emit('attendance_marked', { studentId:req.user._id, sessionId:session._id, status:record.status, timestamp:record.markedAt });
    return res.status(201).json({ success:true, message:isLate?'Marked as LATE.':'Marked as PRESENT.', record:{ status:record.status, markedAt:record.markedAt, minutesLate:record.minutesLate } });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.closeSession = async (req, res) => {
  try {
    const { AttendanceSession } = req.db;
    const AttendanceRecord = req.db.model('AttendanceRecord');
    const Course = req.db.model('Course');
    const session = await AttendanceSession.findOne({ _id: req.params.sessionId });
    if (!session) return res.status(404).json({ success:false, message:'Session not found.' });
    const course  = await Course.findOne({ _id: session.course }).populate('enrolledStudents','_id');
    const marked  = await AttendanceRecord.find({ session:session._id }).select('student');
    const markedIds = marked.map(r=>r.student.toString());
    const absentRecs = (course.enrolledStudents||[]).filter(s=>!markedIds.includes(s._id.toString())).map(s=>({ session:session._id, student:s._id, course:session.course, semester:session.semester, status:'absent', method:'manual', university: req.universityId }));
    if (absentRecs.length) { 
      await AttendanceRecord.insertMany(absentRecs); 
      for(const r of absentRecs) await updateSummary(r.student, session.course, session.semester, req.universityId, req.db); 
    }
    await AttendanceSession.updateOne({ _id:session._id },{ status:'closed', closedAt:new Date(), closedBy:req.user._id });
    req.app.get('io').to(`course_${session.course}`).emit('session_closed', { sessionId:session._id });
    return res.json({ success:true, message:`Session closed. ${absentRecs.length} absent records created.` });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const { AttendanceSession } = req.db;
    const { courseId } = req.params;
    const { semesterId, page=1, limit=20 } = req.query;
    const q = { course:courseId };
    if (semesterId) q.semester = semesterId;
    const data  = await AttendanceSession.find(q).populate('createdBy','firstName lastName').sort({ date:-1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await AttendanceSession.countDocuments(q);
    return res.json({ success:true, data, total, pages:Math.ceil(total/limit) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { AttendanceSummary } = req.db;
    const sid = (req.user.role==='admin'||req.user.role==='teacher') ? req.params.studentId : req.user._id;
    const data = await AttendanceSummary.find({ student:sid }).populate('course','title code creditHours').populate('semester','name academicYear');
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getSessionRecords = async (req, res) => {
  try {
    const { AttendanceRecord } = req.db;
    const data = await AttendanceRecord.find({ 
      session: req.params.sessionId 
    }).populate('student','firstName lastName studentInfo.indexNumber studentInfo.level').sort({ markedAt:1 });
    return res.json({ success:true, data, total:data.length });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const { AttendanceSession } = req.db;
    if (!req.universityId) return res.status(400).json({ success: false, message: 'University required' });
    
    // Find courses student is enrolled in
    const user = await req.db.User.findById(req.user._id);
    const courseIds = user.studentInfo?.registeredCourses || [];
    
    // Find open sessions for these courses
    const sessions = await AttendanceSession.find({
      course: { $in: courseIds },
      status: 'open',
      pinExpiresAt: { $gt: new Date() }
    }).populate('course', 'title code');
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function updateSummary(studentId, courseId, semesterId, universityId, db) {
  try {
    const AttendanceRecord = db.model('AttendanceRecord');
    const AttendanceSession = db.model('AttendanceSession');
    const AttendanceSummary = db.model('AttendanceSummary');
    const records = await AttendanceRecord.find({ student:studentId, course:courseId, semester:semesterId });
    const stats   = records.reduce((a,r)=>{ a[r.status]=(a[r.status]||0)+1; return a; },{});
    const total   = await AttendanceSession.countDocuments({ course:courseId, semester:semesterId, status: { $in: ['open', 'closed', 'expired'] } });
    const present = (stats.present||0)+(stats.late||0);
    const pct     = total>0 ? Math.round((present/total)*100) : 0;
    await AttendanceSummary.findOneAndUpdate(
      { student:studentId, course:courseId, semester:semesterId },
      { totalSessions:total, present:stats.present||0, absent:stats.absent||0, late:stats.late||0, excused:stats.excused||0, attendancePercentage:pct, isAtRisk:pct<60&&pct>=50, isCritical:pct<50, lastUpdated:new Date() },
      { upsert:true, new:true }
    );
  } catch(e){ console.error('updateSummary error:',e.message); }
}
