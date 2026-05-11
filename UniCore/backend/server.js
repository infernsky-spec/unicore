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
app.set('trust proxy', 1); // Required for Railway/Vercel proxy environments
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

// ── Complete Ghana University Registry ─────────────────────────────────────
const GHANA_UNIVERSITIES = [
  // PUBLIC
  { name: 'University of Ghana', shortName: 'UG', location: 'Legon, Accra', type: 'Public' },
  { name: 'Kwame Nkrumah University of Science and Technology', shortName: 'KNUST', location: 'Kumasi', type: 'Public' },
  { name: 'University of Cape Coast', shortName: 'UCC', location: 'Cape Coast', type: 'Public' },
  { name: 'University for Development Studies', shortName: 'UDS', location: 'Tamale', type: 'Public' },
  { name: 'University of Education, Winneba', shortName: 'UEW', location: 'Winneba', type: 'Public' },
  { name: 'University of Mines and Technology', shortName: 'UMaT', location: 'Tarkwa', type: 'Public' },
  { name: 'University of Health and Allied Sciences', shortName: 'UHAS', location: 'Ho', type: 'Public' },
  { name: 'University of Energy and Natural Resources', shortName: 'UENR', location: 'Sunyani', type: 'Public' },
  { name: 'University of Professional Studies Accra', shortName: 'UPSA', location: 'Accra', type: 'Public' },
  { name: 'Ghana Institute of Management & Public Administration', shortName: 'GIMPA', location: 'Greenhill', type: 'Public' },
  { name: 'Ghana Communication Technology University', shortName: 'GCTU', location: 'Accra', type: 'Public' },
  { name: 'Regional Maritime University', shortName: 'RMU', location: 'Tema', type: 'Public' },
  { name: 'Ghana Institute of Journalism', shortName: 'GIJ', location: 'Accra', type: 'Public' },
  { name: 'Valley View University', shortName: 'VVU', location: 'Oyibi', type: 'Public' },
  { name: 'SD Dombo University of Business & Integrated Dev', shortName: 'SDD-UBIDS', location: 'Navrongo', type: 'Public' },
  // TECHNICAL
  { name: 'Takoradi Technical University', shortName: 'TTU', location: 'Takoradi', type: 'Technical' },
  { name: 'Accra Technical University', shortName: 'ATU', location: 'Accra', type: 'Technical' },
  { name: 'Ho Technical University', shortName: 'HTU', location: 'Ho', type: 'Technical' },
  { name: 'Kumasi Technical University', shortName: 'KsTU', location: 'Kumasi', type: 'Technical' },
  { name: 'Bolgatanga Technical University', shortName: 'BTU', location: 'Bolgatanga', type: 'Technical' },
  { name: 'Wa Technical University', shortName: 'WaTU', location: 'Wa', type: 'Technical' },
  { name: 'Cape Coast Technical University', shortName: 'CCTU', location: 'Cape Coast', type: 'Technical' },
  { name: 'Koforidua Technical University', shortName: 'KTU', location: 'Koforidua', type: 'Technical' },
  { name: 'Sunyani Technical University', shortName: 'STU', location: 'Sunyani', type: 'Technical' },
  { name: 'Tamale Technical University', shortName: 'TaTU', location: 'Tamale', type: 'Technical' },
  // PRIVATE
  { name: 'Ashesi University', shortName: 'Ashesi', location: 'Berekuso', type: 'Private' },
  { name: 'Central University', shortName: 'Central', location: 'Miotso', type: 'Private' },
  { name: 'Regent University College of Science & Technology', shortName: 'Regent', location: 'Dansoman', type: 'Private' },
  { name: 'Lancaster University Ghana', shortName: 'LUG', location: 'Central Region', type: 'Private' },
  { name: 'Academic City University College', shortName: 'ACUC', location: 'Accra', type: 'Private' },
  { name: 'All Nations University', shortName: 'ANUC', location: 'Koforidua', type: 'Private' },
  { name: 'Pentecost University', shortName: 'PU', location: 'Sowutuom', type: 'Private' },
  { name: 'Methodist University Ghana', shortName: 'MUG', location: 'Tema', type: 'Private' },
  { name: 'Christian Service University College', shortName: 'CSUC', location: 'Kumasi', type: 'Private' },
  { name: 'Catholic University College of Ghana', shortName: 'CUCG', location: 'Sunyani', type: 'Private' },
  { name: 'Wisconsin International University College', shortName: 'WIUC', location: 'Accra', type: 'Private' },
  { name: 'BlueCrest University College', shortName: 'BlueCrest', location: 'Accra', type: 'Private' },
  { name: 'Radford University College', shortName: 'Radford', location: 'Abokobi', type: 'Private' },
  { name: 'Knutsford University College', shortName: 'Knutsford', location: 'Accra', type: 'Private' },
  { name: 'Data Link University College', shortName: 'DLI', location: 'Tema', type: 'Private' },
  { name: 'Webster University Ghana', shortName: 'Webster', location: 'East Legon', type: 'Private' },
  { name: 'Presbyterian University College', shortName: 'PUCG', location: 'Abetifi', type: 'Private' },
  { name: 'Islamic University College Ghana', shortName: 'IUG', location: 'Accra', type: 'Private' },
  { name: 'KAAF University College', shortName: 'KAAF', location: 'Airport', type: 'Private' },
  { name: 'Accra Institute of Technology', shortName: 'AIT', location: 'Accra', type: 'Private' },
  { name: 'Kings University College', shortName: 'KUC', location: 'Accra', type: 'Private' },
];

const runAutoSeed = async () => {
  if (process.env.AUTO_SEED !== 'true') return;
  try {
    const University = require('./src/models/University');
    const count = await University.countDocuments();
    if (count === 0) {
      console.log('🌱 AUTO_SEED: No universities found. Registering all institutions...');
      const User = require('./src/models/User');
      const { Faculty, Department, Programme, Course, Semester } = require('./src/models/Academic');
      const { Announcement } = require('./src/models/Academic2');
      const { getUniversityConnection, getModel } = require('./src/utils/tenancy');

      // ── Step 1: Register ALL universities in master DB ────────────────
      const registered = [];
      for (const uniData of GHANA_UNIVERSITIES) {
        const dbName = `uni_${uniData.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const uni = await University.create({
          name: uniData.name,
          shortName: uniData.shortName,
          location: uniData.location,
          type: uniData.type,
          dbName,
          isActive: true,
        });
        registered.push({ uni, dbName });
      }
      console.log(`   ✅ Registered ${registered.length} universities in master database.`);

      // ── Step 2: Full seed for the first university (EduBridge Hub = UG) ─
      // Use first uni as demo with full data
      const demoEntry = registered[0];
      const demoUni = demoEntry.uni;
      const demoConn = await getUniversityConnection(demoEntry.dbName);
      const TenantUser = getModel(demoConn, 'User');
      const TenantFaculty = getModel(demoConn, 'Faculty');
      const TenantDepartment = getModel(demoConn, 'Department');
      const TenantProgramme = getModel(demoConn, 'Programme');
      const TenantCourse = getModel(demoConn, 'Course');
      const TenantSemester = getModel(demoConn, 'Semester');
      const TenantAnnouncement = getModel(demoConn, 'Announcement');

      const admin = await TenantUser.create({ firstName: 'System', lastName: 'Admin', email: 'admin@edubridge.edu', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, university: demoUni._id });
      // Also create admin in main DB for global lookup
      await User.create({ firstName: 'System', lastName: 'Admin', email: 'admin@edubridge.edu', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, university: demoUni._id });

      const fac = await TenantFaculty.create({ name: 'Faculty of Computing and Information Systems', code: 'FCIS', description: 'Technology and Information Science', university: demoUni._id });
      const deptIT = await TenantDepartment.create({ name: 'Information Technology', code: 'IT', faculty: fac._id, university: demoUni._id });
      const deptCS = await TenantDepartment.create({ name: 'Computer Science', code: 'CS', faculty: fac._id, university: demoUni._id });
      const progIT = await TenantProgramme.create({ name: 'BSc Information Technology', code: 'BSCIT', department: deptIT._id, faculty: fac._id, duration: 4, degreeType: 'BSc', university: demoUni._id });
      const teacher = await TenantUser.create({ firstName: 'Dr. Kwame', lastName: 'Mensah', email: 'teacher@edubridge.edu', password: 'Teacher@123', role: 'teacher', isActive: true, isEmailVerified: true, university: demoUni._id, teacherInfo: { staffId: 'TCH-001', department: deptIT._id, faculty: fac._id, qualification: 'PhD Computer Science', specialization: 'Databases', rank: 'Senior Lecturer' } });
      const semester = await TenantSemester.create({ name: 'First Semester 2024/2025', academicYear: '2024/2025', semesterNumber: 1, startDate: new Date('2024-09-02'), endDate: new Date('2025-01-17'), status: 'active', isCurrent: true, university: demoUni._id, createdBy: admin._id });
      const c1 = await TenantCourse.create({ title: 'Introduction to Programming', code: 'IT101', creditHours: 3, level: 100, semester: 1, department: deptIT._id, faculty: fac._id, programme: [progIT._id], teachers: [teacher._id], primaryTeacher: teacher._id, capacity: 150, academicYear: '2024/2025', activeSemester: semester._id, isActive: true, university: demoUni._id });
      const student = await TenantUser.create({ firstName: 'Ama', lastName: 'Asante', email: 'student@edubridge.edu', password: 'Student@123', role: 'student', isActive: true, isEmailVerified: true, university: demoUni._id, studentInfo: { indexNumber: 'UG/IT/24/0001', programme: progIT._id, department: deptIT._id, faculty: fac._id, level: 100, year: 1, enrollmentYear: 2024, expectedGraduation: 2028, registeredCourses: [c1._id], linkedToAdmin: true } });
      await TenantAnnouncement.create([
        { title: 'Welcome to UniCore', content: 'Welcome to the Academic Governance Network.', type: 'General', priority: 'high', targetRoles: ['all'], isPublished: true, isPinned: true, createdBy: admin._id, university: demoUni._id },
      ]);
      console.log(`   ✅ Full demo data seeded for ${demoUni.shortName} (${demoEntry.dbName})`);

      // ── Step 3: Create a default admin in each other university's tenant DB ─
      let seededCount = 0;
      for (let i = 1; i < registered.length; i++) {
        try {
          const { uni, dbName } = registered[i];
          const conn = await getUniversityConnection(dbName);
          const TUser = getModel(conn, 'User');
          const shortLower = uni.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
          await TUser.create({
            firstName: 'Admin',
            lastName: uni.shortName,
            email: `admin@${shortLower}.edu`,
            password: 'Admin@123',
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            university: uni._id,
          });
          seededCount++;
        } catch (seedErr) {
          // Skip duplicates or errors silently
          console.warn(`   ⚠️  Seed skipped for ${registered[i].uni.shortName}: ${seedErr.message}`);
        }
      }
      console.log(`   ✅ Admin accounts created for ${seededCount} additional universities.`);
      console.log('\n╔══════════════════════════════════════════╗');
      console.log('║     UniCore Auto-Seed Complete ✅        ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  ${registered.length} universities registered              ║`);
      console.log('║  Each university has its own database    ║');
      console.log('║  Demo: admin@edubridge.edu / Admin@123   ║');
      console.log('╚══════════════════════════════════════════╝\n');
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

