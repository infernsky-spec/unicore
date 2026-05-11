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

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'], credentials: true }
});
initializeSocket(io);
app.set('io', io);

connectDB();

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
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

