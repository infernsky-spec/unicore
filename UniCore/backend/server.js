/**
 * EduBridge University Management System
 * Main Server Entry Point [RELOAD_NODE_1]
 */
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/utils/db');
const errorHandler = require('./src/middleware/errorHandler');
const { initializeSocket } = require('./src/utils/socket');
const fs = require('fs');

// Register all models for tenancy support
require('./src/models/User');
require('./src/models/University');
require('./src/models/Academic');
require('./src/models/Academic2');
require('./src/models/CourseRepRequest');
require('./src/models/AdminKey');
require('./src/models/Attendance');
require('./src/models/Fees');
require('./src/models/TeacherPost');
require('./src/models/Admission');
require('./src/models/Payment');
require('./src/models/Subscription');

const app = express();
const server = http.createServer(app);

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/universities'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
  }
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://unicore-ruddy.vercel.app'
].filter(Boolean);

const io = new Server(server, {
  cors: { 
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET','POST'], 
    credentials: true 
  }
});
initializeSocket(io);
app.set('io', io);

const runAutoSeed = async () => {
  if (process.env.AUTO_SEED !== 'true') return;
  try {
    const University = require('./src/models/University');
    const count = await University.countDocuments();
    if (count === 0) {
      console.log('🌱 AUTO_SEED: No universities found. Running seeder...');
      // Inline seed to avoid path/process.exit issues
      const bcrypt = require('bcryptjs');
      const User = require('./src/models/User');
      const { Faculty, Department, Programme, Course, Semester } = require('./src/models/Academic');
      const { FeeStructure, FeeBill } = require('./src/models/Fees');
      const { Announcement } = require('./src/models/Academic2');

      const uni = await University.create({ name: 'EduBridge Hub', shortName: 'EBH', location: 'Cloud', type: 'Technical', isActive: true });
      const admin = await User.create({ firstName: 'System', lastName: 'Admin', email: 'admin@edubridge.edu', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, university: uni._id });
      const fac = await Faculty.create({ name: 'Faculty of Computing and Information Systems', code: 'FCIS', description: 'Technology and Information Science', university: uni._id });
      const facB = await Faculty.create({ name: 'Faculty of Business', code: 'FB', university: uni._id });
      const deptIT = await Department.create({ name: 'Information Technology', code: 'IT', faculty: fac._id, university: uni._id });
      const deptCS = await Department.create({ name: 'Computer Science', code: 'CS', faculty: fac._id, university: uni._id });
      await Department.create({ name: 'Business Administration', code: 'BA', faculty: facB._id, university: uni._id });
      const progIT = await Programme.create({ name: 'BSc Information Technology', code: 'BSCIT', department: deptIT._id, faculty: fac._id, duration: 4, degreeType: 'BSc', university: uni._id });
      await Programme.create({ name: 'BSc Computer Science', code: 'BSCCS', department: deptCS._id, faculty: fac._id, duration: 4, degreeType: 'BSc', university: uni._id });
      const teacher = await User.create({ firstName: 'Dr. Kwame', lastName: 'Mensah', email: 'teacher@edubridge.edu', password: 'Teacher@123', role: 'teacher', isActive: true, isEmailVerified: true, university: uni._id, teacherInfo: { staffId: 'TCH-001', department: deptIT._id, faculty: fac._id, qualification: 'PhD Computer Science', specialization: 'Databases', rank: 'Senior Lecturer', officeLocation: 'Block A Room 205' } });
      const semester = await Semester.create({ name: 'First Semester 2024/2025', academicYear: '2024/2025', semesterNumber: 1, startDate: new Date('2024-09-02'), endDate: new Date('2025-01-17'), examStartDate: new Date('2025-01-06'), examEndDate: new Date('2025-01-17'), registrationDeadline: new Date('2024-09-20'), status: 'active', isCurrent: true, university: uni._id, createdBy: admin._id });
      const c1 = await Course.create({ title: 'Introduction to Programming', code: 'IT101', description: 'Fundamentals using Python', creditHours: 3, level: 100, semester: 1, department: deptIT._id, faculty: fac._id, programme: [progIT._id], teachers: [teacher._id], primaryTeacher: teacher._id, capacity: 150, academicYear: '2024/2025', activeSemester: semester._id, isActive: true, university: uni._id, schedule: [{ day: 'Monday', startTime: '08:00', endTime: '10:00', venue: 'Lecture Hall A', type: 'Lecture' }] });
      const c2 = await Course.create({ title: 'Database Management Systems', code: 'IT201', creditHours: 3, level: 200, semester: 1, department: deptIT._id, faculty: fac._id, programme: [progIT._id], university: uni._id, teachers: [teacher._id], primaryTeacher: teacher._id, academicYear: '2024/2025', activeSemester: semester._id, isActive: true, schedule: [{ day: 'Tuesday', startTime: '10:00', endTime: '12:00', venue: 'Lecture Hall B', type: 'Lecture' }] });
      const c3 = await Course.create({ title: 'Web Development', code: 'IT102', creditHours: 3, level: 100, semester: 1, department: deptIT._id, faculty: fac._id, programme: [progIT._id], university: uni._id, teachers: [teacher._id], primaryTeacher: teacher._id, academicYear: '2024/2025', activeSemester: semester._id, isActive: true, schedule: [{ day: 'Thursday', startTime: '08:00', endTime: '10:00', venue: 'Lab 2', type: 'Lab' }] });
      await User.findByIdAndUpdate(teacher._id, { 'teacherInfo.courses': [c1._id, c2._id, c3._id] });
      const student = await User.create({ firstName: 'Ama', lastName: 'Asante', email: 'student@edubridge.edu', password: 'Student@123', role: 'student', isActive: true, isEmailVerified: true, university: uni._id, studentInfo: { indexNumber: 'EDU/IT/24/0001', programme: progIT._id, department: deptIT._id, faculty: fac._id, level: 100, year: 1, enrollmentYear: 2024, expectedGraduation: 2028, isCourseRep: false, registeredCourses: [c1._id, c3._id], linkedToAdmin: true } });
      const rep = await User.create({ firstName: 'Kofi', lastName: 'Boateng', email: 'courserep@edubridge.edu', password: 'CourseRep@123', role: 'course_rep', isActive: true, isEmailVerified: true, university: uni._id, studentInfo: { indexNumber: 'EDU/IT/24/0002', programme: progIT._id, department: deptIT._id, faculty: fac._id, level: 100, year: 1, enrollmentYear: 2024, expectedGraduation: 2028, isCourseRep: true, courseRepFor: [c1._id], registeredCourses: [c1._id], linkedToAdmin: true } });
      await Course.findByIdAndUpdate(c1._id, { $addToSet: { enrolledStudents: { $each: [student._id, rep._id] } }, courseRep: rep._id });
      await Announcement.create([
        { title: 'Welcome to 2024/2025', content: 'The administration warmly welcomes all students and staff.', type: 'General', priority: 'high', targetRoles: ['all'], isPublished: true, isPinned: true, createdBy: admin._id, university: uni._id },
        { title: 'Course Registration Open', content: 'All students must register their courses before September 20.', type: 'Academic', priority: 'urgent', targetRoles: ['student'], isPublished: true, createdBy: admin._id, university: uni._id },
      ]);
      console.log('✅ AUTO_SEED: Database seeded successfully!');
      console.log('   admin@edubridge.edu / Admin@123');
      console.log('   teacher@edubridge.edu / Teacher@123');
      console.log('   student@edubridge.edu / Student@123');
    } else {
      console.log(`✅ AUTO_SEED: ${count} universities already exist. Skipping seed.`);
    }
  } catch (err) {
    console.error('⚠️  AUTO_SEED error:', err.message);
  }
};

connectDB().then(runAutoSeed);

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-university-id']
}));
app.use(rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  message: { success: false, message: 'Too many requests.' },
  standardHeaders: true, legacyHeaders: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'UP', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'UP', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ name: 'EduBridge API', version: '2.0.1' }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/teachers', require('./src/routes/teacher'));
app.use('/api/students', require('./src/routes/student'));
app.use('/api/parents', require('./src/routes/parent'));
app.use('/api/courses', require('./src/routes/course'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/fees', require('./src/routes/fees'));
app.use('/api/resources', require('./src/routes/resources'));
app.use('/api/announcements', require('./src/routes/announcements'));
app.use('/api/semesters', require('./src/routes/semester'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/api/exams', require('./src/routes/exams'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/registration', require('./src/routes/registration'));
app.use('/api/import', require('./src/routes/import'));
app.use('/api/payments', require('./src/routes/payment-fixed.js'));
app.use('/api/teacher-posts', require('./src/routes/teacherpost'));
app.use('/api/universities', require('./src/routes/universities'));
app.use('/api/admin-keys', require('./src/routes/adminKeys'));
app.use('/api/course-rep', require('./src/routes/courseRep'));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

app.use(errorHandler);

const PORT = parseInt(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log('\\n╔════════════════════════════════════════╗');
  console.log('║    EduBridge University System         ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Port : ' + PORT + '   Mode: ' + process.env.NODE_ENV + '         ║');
  console.log('║  URL  : http://localhost:' + PORT + '           ║');
  console.log('\\n╚════════════════════════════════════════╝');
});

process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err.message));
module.exports = { app, server };

