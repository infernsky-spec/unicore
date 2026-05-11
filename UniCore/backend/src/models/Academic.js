const mongoose = require('mongoose');

// ─── FACULTY ─────────────────────────────────────────────────────────────────
const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  dean: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  establishedYear: Number,
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

facultySchema.index({ name: 1, university: 1 }, { unique: true });
facultySchema.index({ code: 1, university: 1 }, { unique: true });

// ─── DEPARTMENT ───────────────────────────────────────────────────────────────
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ name: 1, university: 1 }, { unique: true });
departmentSchema.index({ code: 1, university: 1 }, { unique: true });

// ─── PROGRAMME ────────────────────────────────────────────────────────────────
const programmeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  duration: { type: Number, required: true, comment: 'In years' },
  degreeType: { type: String, enum: ['BSc', 'BA', 'BEng', 'LLB', 'MBChB', 'MSc', 'MA', 'PhD', 'HND', 'Diploma'] },
  description: String,
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

programmeSchema.index({ name: 1, university: 1 }, { unique: true });
programmeSchema.index({ code: 1, university: 1 }, { unique: true });

// ─── COURSE ───────────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  description: { type: String },
  creditHours: { type: Number, required: true, min: 1, max: 6 },
  level: { type: Number, enum: [100, 200, 300, 400, 500, 600] },
  semester: { type: Number, enum: [1, 2] },
  
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  programme: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Programme' }],
  
  // Assigned teachers
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  primaryTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Enrolled students
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  capacity: { type: Number, default: 200 },
  
  // Course schedule (weekly)
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    startTime: String,
    endTime: String,
    venue: String,
    type: { type: String, enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar'] },
  }],
  
  // Course rep
  courseRep: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Academic year and semester context
  academicYear: { type: String },
  activeSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  
  isElective: { type: Boolean, default: false },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

courseSchema.index({ code: 1, university: 1, academicYear: 1 }, { unique: true });

courseSchema.index({ code: 1, academicYear: 1 });

// ─── SEMESTER ─────────────────────────────────────────────────────────────────
const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, comment: 'e.g. First Semester 2024/2025' },
  academicYear: { type: String, required: true, comment: 'e.g. 2024/2025' },
  semesterNumber: { type: Number, enum: [1, 2], required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Key dates
  examStartDate: { type: Date },
  examEndDate: { type: Date },
  registrationDeadline: { type: Date },
  addDropDeadline: { type: Date },
  resultReleaseDate: { type: Date },
  
  // Admin-defined goals for the semester
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  }],
  
  // Events
  events: [{
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    endDate: Date,
    type: { type: String, enum: ['Holiday', 'Exam', 'Deadline', 'Event', 'Registration', 'Other'] },
    isPublic: { type: Boolean, default: true },
    venue: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  isCurrent: { type: Boolean, default: false },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

semesterSchema.index({ name: 1, university: 1 }, { unique: true });
semesterSchema.index({ isCurrent: 1, university: 1 });

module.exports = {
  Faculty: mongoose.model('Faculty', facultySchema),
  Department: mongoose.model('Department', departmentSchema),
  Programme: mongoose.model('Programme', programmeSchema),
  Course: mongoose.model('Course', courseSchema),
  Semester: mongoose.model('Semester', semesterSchema),
};
