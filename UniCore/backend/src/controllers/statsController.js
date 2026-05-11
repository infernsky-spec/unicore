const User = require('../models/User');
const { Course, Semester } = require('../models/Academic');
const { AttendanceSession, AttendanceSummary } = require('../models/Attendance');
const { FeeBill } = require('../models/Fees');
const { Announcement, Result } = require('../models/Academic2');

const University = require('../models/University');
const { getUniversityConnection, getModel } = require('../utils/tenancy');

exports.getGlobalStats = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true });
    let globalOverview = { totalUniversities: universities.length, totalStudents: 0, totalTeachers: 0, totalCourses: 0 };
    let uniBreakdown = [];

    for (let i = 0; i < universities.length; i += 10) {
      const batch = universities.slice(i, i + 10);
      await Promise.all(batch.map(async (uni) => {
        try {
          const dbName = uni.dbName || `uni_${uni.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const conn = await getUniversityConnection(dbName);
          const TenantUser = getModel(conn, 'User');
          const TenantCourse = getModel(conn, 'Course');

          const [sCount, tCount, cCount] = await Promise.all([
            TenantUser.countDocuments({ role: { $in: ['student', 'course_rep'] }, isActive: true }),
            TenantUser.countDocuments({ role: 'teacher', isActive: true }),
            TenantCourse.countDocuments({ isActive: true })
          ]);

          globalOverview.totalStudents += sCount;
          globalOverview.totalTeachers += tCount;
          globalOverview.totalCourses += cCount;

          uniBreakdown.push({
            id: uni._id,
            name: uni.name,
            shortName: uni.shortName,
            students: sCount,
            teachers: tCount,
            courses: cCount
          });
        } catch (err) {
          console.error(`Failed to fetch stats for ${uni.shortName}:`, err.message);
        }
      }));
    }

    // Sort descending by student count
    uniBreakdown.sort((a, b) => b.students - a.students);

    res.json({ success: true, data: { globalOverview, uniBreakdown } });
  } catch (e) {

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const User = req.db.User;
    const Course = req.db.model('Course');
    const Semester = req.db.model('Semester');
    const AttendanceSummary = req.db.model('AttendanceSummary');
    const FeeBill = req.db.model('FeeBill');
    
    const [totalStudents, totalTeachers, totalCourses, activeSemester, feeSummary, attSummary, recentUsers, enrollmentByLevel, genderStats] = await Promise.all([
      User.countDocuments({ role:{ $in:['student','course_rep'] }, isActive:true }),
      User.countDocuments({ role:'teacher', isActive:true }),
      Course.countDocuments({ isActive:true }),
      Semester.findOne({ isCurrent:true }),
      FeeBill.aggregate([{ $group:{ _id:null, totalBilled:{ $sum:'$totalBilled' }, totalPaid:{ $sum:'$totalPaid' }, totalBalance:{ $sum:'$balance' } } }]),
      AttendanceSummary.aggregate([{ $group:{ _id:null, avgAttendance:{ $avg:'$attendancePercentage' }, atRisk:{ $sum:{ $cond:['$isAtRisk',1,0] } }, critical:{ $sum:{ $cond:['$isCritical',1,0] } } } }]),
      User.find({ isActive:true }).sort({ createdAt:-1 }).limit(5).select('firstName lastName role createdAt'),
      User.aggregate([{ $match:{ role:{ $in:['student','course_rep'] }, isActive:true } },{ $group:{ _id:'$studentInfo.level', count:{ $sum:1 } } },{ $sort:{ _id:1 } }]),
      User.aggregate([{ $match:{ role:{ $in:['student','course_rep'] }, isActive:true } },{ $group:{ _id:'$gender', count:{ $sum:1 } } }]),
    ]);
    return res.json({ success:true, data:{
      overview:{ totalStudents, totalTeachers, totalCourses, currentSemester:activeSemester?.name||'Not set' },
      fees: feeSummary[0] || { totalBilled:0, totalPaid:0, totalBalance:0 },
      attendance: attSummary[0] || { avgAttendance:0, atRisk:0, critical:0 },
      enrollmentByLevel, genderStats, recentActivity:recentUsers,
    }});
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getStudentStats = async (req, res) => {
  try {
    const sid = req.user._id;
    const AttendanceSummary = req.db.model('AttendanceSummary');
    const FeeBill = req.db.model('FeeBill');
    const Result = req.db.model('Result');
    const Announcement = req.db.model('Announcement');

    const [attSummaries, feeBill, results, announcements] = await Promise.all([
      AttendanceSummary.find({ student:sid }).populate('course','title code'),
      FeeBill.findOne({ student:sid }).sort({ createdAt:-1 }),
      Result.find({ student:sid, isPublished:true }).populate('course','title code creditHours'),
      Announcement.find({ isPublished:true }).sort({ createdAt:-1 }).limit(5).select('title type priority createdAt'),
    ]);
    let gpa = 0, totalCredits = 0;
    if (results.length) {
      let pts = 0;
      results.forEach(r=>{ const c=r.course?.creditHours||3; pts+=(r.gradePoint||0)*c; totalCredits+=c; });
      gpa = totalCredits ? (pts/totalCredits).toFixed(2) : 0;
    }
    const avgAtt = attSummaries.length ? Math.round(attSummaries.reduce((s,a)=>s+a.attendancePercentage,0)/attSummaries.length) : 0;
    return res.json({ success:true, data:{ attendance:{ summaries:attSummaries, average:avgAtt }, fees:feeBill||null, academic:{ gpa, totalCredits, resultsCount:results.length }, recentAnnouncements:announcements } });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};

exports.getTeacherStats = async (req, res) => {
  try {
    const Course = req.db.model('Course');
    const AttendanceSession = req.db.model('AttendanceSession');
    const teacherCourses = req.user.teacherInfo?.courses || [];
    const [totalStudents, attendanceSessions, recentSessions] = await Promise.all([
      Course.aggregate([{ $match:{ _id:{ $in:teacherCourses } } },{ $group:{ _id:null, total:{ $sum:{ $size:'$enrolledStudents' } } } }]),
      AttendanceSession.countDocuments({ createdBy:req.user._id }),
      AttendanceSession.find({ createdBy:req.user._id }).sort({ createdAt:-1 }).limit(5).populate('course','title code'),
    ]);
    return res.json({ success:true, data:{ totalCourses:teacherCourses.length, totalStudents:totalStudents[0]?.total||0, attendanceSessions, recentSessions } });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
};
