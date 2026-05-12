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
  { name: 'University of Ghana', shortName: 'UG', location: 'Legon, Accra', type: 'Public', logo: '/logos/ug.png' },
  { name: 'Kwame Nkrumah University of Science and Technology', shortName: 'KNUST', location: 'Kumasi', type: 'Public', logo: '/logos/knust.png' },
  { name: 'University of Cape Coast', shortName: 'UCC', location: 'Cape Coast', type: 'Public', logo: '/logos/ucc.png' },
  { name: 'University for Development Studies', shortName: 'UDS', location: 'Tamale', type: 'Public', logo: '/logos/uds.png' },
  { name: 'University of Education, Winneba', shortName: 'UEW', location: 'Winneba', type: 'Public', logo: '/logos/uew.png' },
  { name: 'University of Mines and Technology', shortName: 'UMaT', location: 'Tarkwa', type: 'Public', logo: '/logos/umat.png' },
  { name: 'University of Health and Allied Sciences', shortName: 'UHAS', location: 'Ho', type: 'Public', logo: '/logos/uhas.png' },
  { name: 'University of Energy and Natural Resources', shortName: 'UENR', location: 'Sunyani', type: 'Public', logo: '/logos/uenr.png' },
  { name: 'University of Professional Studies Accra', shortName: 'UPSA', location: 'Accra', type: 'Public', logo: '/logos/upsa.png' },
  { name: 'Ghana Institute of Management & Public Administration', shortName: 'GIMPA', location: 'Greenhill', type: 'Public', logo: '/logos/gimpa.png' },
  { name: 'Ghana Communication Technology University', shortName: 'GCTU', location: 'Accra', type: 'Public', logo: '/logos/gctu.png' },
  { name: 'Regional Maritime University', shortName: 'RMU', location: 'Tema', type: 'Public', logo: '/logos/rmu.png' },
  { name: 'Ghana Institute of Journalism', shortName: 'GIJ', location: 'Accra', type: 'Public', logo: '/logos/gij.png' },
  { name: 'Valley View University', shortName: 'VVU', location: 'Oyibi', type: 'Public', logo: '/logos/vvu.png' },
  { name: 'SD Dombo University of Business & Integrated Dev', shortName: 'SDD-UBIDS', location: 'Navrongo', type: 'Public', logo: '/logos/sdd-ubids.png' },
  // TECHNICAL
  { name: 'Takoradi Technical University', shortName: 'TTU', location: 'Takoradi', type: 'Technical', logo: '/logos/ttu.png' },
  { name: 'Accra Technical University', shortName: 'ATU', location: 'Accra', type: 'Technical', logo: '/logos/atu.png' },
  { name: 'Ho Technical University', shortName: 'HTU', location: 'Ho', type: 'Technical', logo: '/logos/hto.png' },
  { name: 'Kumasi Technical University', shortName: 'KsTU', location: 'Kumasi', type: 'Technical', logo: '/logos/kstu.png' },
  { name: 'Bolgatanga Technical University', shortName: 'BTU', location: 'Bolgatanga', type: 'Technical', logo: '/logos/btu.png' },
  { name: 'Wa Technical University', shortName: 'WaTU', location: 'Wa', type: 'Technical', logo: '/logos/watu.png' },
  { name: 'Cape Coast Technical University', shortName: 'CCTU', location: 'Cape Coast', type: 'Technical', logo: '/logos/cctu.png' },
  { name: 'Koforidua Technical University', shortName: 'KTU', location: 'Koforidua', type: 'Technical', logo: '/logos/ktu.png' },
  { name: 'Sunyani Technical University', shortName: 'STU', location: 'Sunyani', type: 'Technical', logo: '/logos/stu.png' },
  { name: 'Tamale Technical University', shortName: 'TaTU', location: 'Tamale', type: 'Technical', logo: '/logos/tatu.png' },
  // PRIVATE
  { name: 'Ashesi University', shortName: 'Ashesi', location: 'Berekuso', type: 'Private', logo: '/logos/ashesi.png' },
  { name: 'Central University', shortName: 'Central', location: 'Miotso', type: 'Private', logo: '/logos/central.png' },
  { name: 'Regent University College of Science & Technology', shortName: 'Regent', location: 'Dansoman', type: 'Private', logo: '/logos/regent.png' },
  { name: 'Lancaster University Ghana', shortName: 'LUG', location: 'Central Region', type: 'Private', logo: '/logos/lancester.png' },
  { name: 'Academic City University College', shortName: 'ACUC', location: 'Accra', type: 'Private', logo: '/logos/acuc.png' },
  { name: 'All Nations University', shortName: 'ANUC', location: 'Koforidua', type: 'Private', logo: '/logos/anuc.png' },
  { name: 'Pentecost University', shortName: 'PU', location: 'Sowutuom', type: 'Private', logo: '/logos/pu.png' },
  { name: 'Methodist University Ghana', shortName: 'MUG', location: 'Tema', type: 'Private', logo: '/logos/mug.png' },
  { name: 'Christian Service University College', shortName: 'CSUC', location: 'Kumasi', type: 'Private', logo: '/logos/csuc.png' },
  { name: 'Catholic University College of Ghana', shortName: 'CUCG', location: 'Sunyani', type: 'Private', logo: '/logos/cucg.png' },
  { name: 'Wisconsin International University College', shortName: 'WIUC', location: 'Accra', type: 'Private', logo: '/logos/wiuc.png' },
  { name: 'BlueCrest University College', shortName: 'BlueCrest', location: 'Accra', type: 'Private', logo: '/logos/bluecrest.png' },
  { name: 'Radford University College', shortName: 'Radford', location: 'Abokobi', type: 'Private', logo: '/logos/radford.png' },
  { name: 'Knutsford University College', shortName: 'Knutsford', location: 'Accra', type: 'Private', logo: '/logos/knutsford.png' },
  { name: 'Data Link University College', shortName: 'DLI', location: 'Tema', type: 'Private', logo: '/logos/dli.png' },
  { name: 'Webster University Ghana', shortName: 'Webster', location: 'East Legon', type: 'Private', logo: '/logos/webster.png' },
  { name: 'Presbyterian University College', shortName: 'PUCG', location: 'Abetifi', type: 'Private', logo: '/logos/pucg.png' },
  { name: 'Islamic University College Ghana', shortName: 'IUG', location: 'Accra', type: 'Private', logo: '/logos/iug.png' },
  { name: 'KAAF University College', shortName: 'KAAF', location: 'Airport', type: 'Private', logo: '/logos/kaaf.png' },
  { name: 'Accra Institute of Technology', shortName: 'AIT', location: 'Accra', type: 'Private', logo: '/logos/ait.png' },
  { name: 'Kings University College', shortName: 'KUC', location: 'Accra', type: 'Private', logo: '/logos/kuc.png' },
];

const runAutoSeed = async () => {
  if (process.env.AUTO_SEED !== 'true') return;
  try {
    const University = require('./src/models/University');
    console.log('🌱 AUTO_SEED: Checking university registry...');
    const User = require('./src/models/User');
    const { Faculty, Department, Programme, Course, Semester } = require('./src/models/Academic');
    const { Announcement } = require('./src/models/Academic2');
    const { getUniversityConnection, getModel } = require('./src/utils/tenancy');

    // ── Step 1: Ensure ALL universities are in master DB ────────────────
    const registered = [];
    for (const uniData of GHANA_UNIVERSITIES) {
      const dbName = `uni_${uniData.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const uni = await University.findOneAndUpdate(
        { shortName: uniData.shortName },
        { 
          name: uniData.name,
          location: uniData.location,
          type: uniData.type,
          logo: uniData.logo,
          dbName,
          isActive: true
        },
        { upsert: true, new: true }
      );
      registered.push({ uni, dbName });
    }
    console.log(`   ✅ Synced ${registered.length} universities in master database.`);

    const count = await University.countDocuments();
    // Only seed deep data if this is the first run or specific demo uni is empty
    const demoEntry = registered.find(r => r.uni.shortName === 'UG') || registered[0];
    const demoConn = await getUniversityConnection(demoEntry.dbName);
    const TenantUser = getModel(demoConn, 'User');
    
    const adminExists = await TenantUser.findOne({ email: 'admin@edubridge.edu' });
    if (!adminExists) {
      console.log(`🌱 AUTO_SEED: Seeding deep demo data for ${demoEntry.uni.name}...`);
      const TenantFaculty = getModel(demoConn, 'Faculty');
      const TenantDepartment = getModel(demoConn, 'Department');
      const TenantProgramme = getModel(demoConn, 'Programme');
      const TenantCourse = getModel(demoConn, 'Course');
      const TenantSemester = getModel(demoConn, 'Semester');
      const TenantAnnouncement = getModel(demoConn, 'Announcement');

      const admin = await TenantUser.create({ firstName: 'System', lastName: 'Admin', email: 'admin@edubridge.edu', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, university: demoEntry.uni._id });
      // Also ensure in global
      await User.findOneAndUpdate({ email: 'admin@edubridge.edu' }, { firstName: 'System', lastName: 'Admin', password: 'Admin@123', role: 'admin', isActive: true, university: demoEntry.uni._id }, { upsert: true });

      const fac = await TenantFaculty.create({ name: 'Faculty of Computing and Information Systems', code: 'FCIS', description: 'Technology and Information Science', university: demoEntry.uni._id });
      const deptIT = await TenantDepartment.create({ name: 'Information Technology', code: 'IT', faculty: fac._id, university: demoEntry.uni._id });
      const progIT = await TenantProgramme.create({ name: 'BSc Information Technology', code: 'BSCIT', department: deptIT._id, faculty: fac._id, duration: 4, degreeType: 'BSc', university: demoEntry.uni._id });
      const teacher = await TenantUser.create({ firstName: 'Dr. Kwame', lastName: 'Mensah', email: 'teacher@edubridge.edu', password: 'Teacher@123', role: 'teacher', isActive: true, isEmailVerified: true, university: demoEntry.uni._id, teacherInfo: { staffId: 'TCH-001', department: deptIT._id, faculty: fac._id, qualification: 'PhD Computer Science' } });
      const semester = await TenantSemester.create({ name: 'First Semester 2024/2025', academicYear: '2024/2025', semesterNumber: 1, startDate: new Date('2024-09-02'), endDate: new Date('2025-01-17'), status: 'active', isCurrent: true, university: demoEntry.uni._id, createdBy: admin._id });
      const c1 = await TenantCourse.create({ title: 'Introduction to Programming', code: 'IT101', creditHours: 3, level: 100, semester: 1, department: deptIT._id, faculty: fac._id, programme: [progIT._id], teachers: [teacher._id], primaryTeacher: teacher._id, university: demoEntry.uni._id });
      await TenantAnnouncement.create([
        { title: 'Welcome to UniCore', content: 'Academic Governance Network initialized.', type: 'General', priority: 'high', targetRoles: ['all'], isPublished: true, createdBy: admin._id, university: demoEntry.uni._id },
      ]);
      console.log(`   ✅ Deep seed complete for ${demoEntry.uni.shortName}.`);
    }

    // ── Step 3: Ensure each university has at least one admin ─────────────
    console.log('🌱 AUTO_SEED: Verifying tenant admins...');
    let seededCount = 0;
    for (const entry of registered) {
      try {
        const { uni, dbName } = entry;
        const conn = await getUniversityConnection(dbName);
        const TUser = getModel(conn, 'User');
        const shortLower = uni.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const email = `admin@${shortLower}.edu`;
        
        const exists = await TUser.findOne({ role: 'admin' });
        if (!exists) {
          await TUser.create({
            firstName: 'Admin',
            lastName: uni.shortName,
            email,
            password: 'Admin@123',
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            university: uni._id,
          });
          seededCount++;
        }
      } catch (seedErr) {
        // Skip
      }
    }
    console.log(`   ✅ Verified ${registered.length} tenant nodes. Created ${seededCount} new admin accounts.`);
    
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║     UniCore Multi-Tenant Ready! ✅       ║');
    console.log('╚══════════════════════════════════════════╝\n');
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

