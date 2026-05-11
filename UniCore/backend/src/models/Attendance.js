const mongoose = require('mongoose');

// ─── ATTENDANCE SESSION ───────────────────────────────────────────────────────
// A session is created by a teacher/course rep when a class starts
const attendanceSessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  
  // Session PIN (6-digit) — students use this to mark attendance
  sessionPin: { type: String, required: true },
  pinExpiresAt: { type: Date, required: true },
  
  // Who created this session
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByRole: { type: String, enum: ['teacher', 'course_rep'] },
  
  // Verification — course rep confirms physical presence
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  
  // Session window
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  venue: { type: String },
  type: { type: String, enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar'], default: 'Lecture' },
  
  // Session status
  status: { type: String, enum: ['open', 'closed', 'expired'], default: 'open' },
  closedAt: { type: Date },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Stats (denormalized for quick access)
  totalEnrolled: { type: Number, default: 0 },
  totalPresent: { type: Number, default: 0 },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  notes: String,
}, { timestamps: true });

attendanceSessionSchema.index({ course: 1, university: 1, date: -1 });
attendanceSessionSchema.index({ sessionPin: 1, university: 1, status: 1 });

// ─── ATTENDANCE RECORD ────────────────────────────────────────────────────────
// One record per student per session
const attendanceRecordSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present',
  },
  
  // When the student marked attendance
  markedAt: { type: Date, default: Date.now },
  
  // How they marked it
  method: { type: String, enum: ['pin', 'manual', 'qr'], default: 'pin' },
  
  // Late threshold
  minutesLate: { type: Number, default: 0 },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  
  // Manual override by teacher
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overrideReason: { type: String },
  
  // Excusal
  excusedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  excuseNote: { type: String },
  
  ipAddress: String,
}, { timestamps: true });

attendanceRecordSchema.index({ session: 1, student: 1, university: 1 }, { unique: true });
attendanceRecordSchema.index({ student: 1, university: 1, course: 1, semester: 1 });

// ─── ATTENDANCE SUMMARY ───────────────────────────────────────────────────────
// Aggregated per student per course per semester
const attendanceSummarySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  
  totalSessions: { type: Number, default: 0 },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  excused: { type: Number, default: 0 },
  
  attendancePercentage: { type: Number, default: 0 },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  
  // Warning flags
  isAtRisk: { type: Boolean, default: false },      // Below 60%
  isCritical: { type: Boolean, default: false },    // Below 50%
  warningIssued: { type: Boolean, default: false },
  
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

attendanceSummarySchema.index({ student: 1, course: 1, semester: 1, university: 1 }, { unique: true });

module.exports = {
  AttendanceSession: mongoose.model('AttendanceSession', attendanceSessionSchema),
  AttendanceRecord: mongoose.model('AttendanceRecord', attendanceRecordSchema),
  AttendanceSummary: mongoose.model('AttendanceSummary', attendanceSummarySchema),
};
