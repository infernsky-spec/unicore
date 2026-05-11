require('dotenv').config({ path: require('path').join(__dirname,'../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const { Faculty, Department, Programme, Course, Semester } = require('../models/Academic');
const { FeeStructure, FeeBill } = require('../models/Fees');
const { Announcement }          = require('../models/Academic2');
const University                = require('../models/University');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  if (process.argv.includes('--clear')) {
    await Promise.all([University,User,Faculty,Department,Programme,Course,Semester,FeeStructure,FeeBill,Announcement].map(M=>M.deleteMany({})));
    console.log('DB cleared'); process.exit(0);
  }

  await Promise.all([University,User,Faculty,Department,Programme,Course,Semester,FeeStructure,FeeBill,Announcement].map(M=>M.deleteMany({})));

  // University
  const uni = await University.create({ name:'EduBridge Hub', shortName:'EBH', location:'Cloud', type:'Technical', isActive:true });

  // Admin
  const admin = await User.create({ firstName:'System', lastName:'Admin', email:'admin@edubridge.edu', password:'Admin@123', role:'admin', isActive:true, isEmailVerified:true, university: uni._id });
  console.log('Admin:', admin.email);

  // Faculty
  const fac = await Faculty.create({ name:'Faculty of Computing and Information Systems', code:'FCIS', description:'Technology and Information Science', university: uni._id });
  const facB = await Faculty.create({ name:'Faculty of Business', code:'FB', university: uni._id });

  // Departments
  const deptIT = await Department.create({ name:'Information Technology', code:'IT', faculty:fac._id, university: uni._id });
  const deptCS = await Department.create({ name:'Computer Science',       code:'CS', faculty:fac._id, university: uni._id });
  const deptBA = await Department.create({ name:'Business Administration',code:'BA', faculty:facB._id, university: uni._id });

  // Programmes
  const progIT = await Programme.create({ name:'BSc Information Technology', code:'BSCIT', department:deptIT._id, faculty:fac._id, duration:4, degreeType:'BSc', university: uni._id });
  const progCS = await Programme.create({ name:'BSc Computer Science',       code:'BSCCS', department:deptCS._id, faculty:fac._id, duration:4, degreeType:'BSc', university: uni._id });

  // Teacher
  const teacher = await User.create({
    firstName:'Dr. Kwame', lastName:'Mensah', email:'teacher@edubridge.edu', password:'Teacher@123',
    role:'teacher', isActive:true, isEmailVerified:true, university: uni._id,
    teacherInfo:{ staffId:'TCH-001', department:deptIT._id, faculty:fac._id, qualification:'PhD Computer Science', specialization:'Databases', rank:'Senior Lecturer', officeLocation:'Block A Room 205' }
  });
  console.log('Teacher:', teacher.email);

  // Semester
  const semester = await Semester.create({
    name:'First Semester 2024/2025', academicYear:'2024/2025', semesterNumber:1,
    startDate:new Date('2024-09-02'), endDate:new Date('2025-01-17'),
    examStartDate:new Date('2025-01-06'), examEndDate:new Date('2025-01-17'),
    registrationDeadline:new Date('2024-09-20'), status:'active', isCurrent:true, university: uni._id,
    goals:[{ title:'Complete module outlines', description:'All lecturers submit by Week 2', targetDate:new Date('2024-09-16') }],
    events:[
      { title:'Semester Begins', date:new Date('2024-09-02'), type:'Event', isPublic:true },
      { title:'Registration Deadline', date:new Date('2024-09-20'), type:'Deadline', isPublic:true },
      { title:'End-of-Semester Exams', date:new Date('2025-01-06'), endDate:new Date('2025-01-17'), type:'Exam', isPublic:true },
    ],
    createdBy:admin._id
  });

  // Courses
  const c1 = await Course.create({
    title:'Introduction to Programming', code:'IT101', description:'Fundamentals using Python',
    creditHours:3, level:100, semester:1, department:deptIT._id, faculty:fac._id,
    programme:[progIT._id], teachers:[teacher._id], primaryTeacher:teacher._id,
    capacity:150, academicYear:'2024/2025', activeSemester:semester._id, isActive:true, university: uni._id,
    schedule:[
      { day:'Monday',    startTime:'08:00', endTime:'10:00', venue:'Lecture Hall A', type:'Lecture' },
      { day:'Wednesday', startTime:'10:00', endTime:'12:00', venue:'Lab 1',          type:'Lab' },
    ]
  });
  const c2 = await Course.create({
    title:'Database Management Systems', code:'IT201', creditHours:3, level:200, semester:1,
    department:deptIT._id, faculty:fac._id, programme:[progIT._id], university: uni._id,
    teachers:[teacher._id], primaryTeacher:teacher._id, academicYear:'2024/2025',
    activeSemester:semester._id, isActive:true,
    schedule:[{ day:'Tuesday', startTime:'10:00', endTime:'12:00', venue:'Lecture Hall B', type:'Lecture' }]
  });
  const c3 = await Course.create({
    title:'Web Development', code:'IT102', creditHours:3, level:100, semester:1,
    department:deptIT._id, faculty:fac._id, programme:[progIT._id], university: uni._id,
    teachers:[teacher._id], primaryTeacher:teacher._id, academicYear:'2024/2025',
    activeSemester:semester._id, isActive:true,
    schedule:[{ day:'Thursday', startTime:'08:00', endTime:'10:00', venue:'Lab 2', type:'Lab' }]
  });
  await User.findByIdAndUpdate(teacher._id, { 'teacherInfo.courses':[c1._id,c2._id,c3._id] });
  console.log('Courses created');

  // Student
  const student = await User.create({
    firstName:'Ama', lastName:'Asante', email:'student@edubridge.edu', password:'Student@123',
    role:'student', isActive:true, isEmailVerified:true, university: uni._id,
    studentInfo:{ indexNumber:'EDU/IT/24/0001', programme:progIT._id, department:deptIT._id, faculty:fac._id, level:100, year:1, enrollmentYear:2024, expectedGraduation:2028, isCourseRep:false, registeredCourses:[c1._id,c3._id], linkedToAdmin:true }
  });

  // Course Rep
  const rep = await User.create({
    firstName:'Kofi', lastName:'Boateng', email:'courserep@edubridge.edu', password:'CourseRep@123',
    role:'course_rep', isActive:true, isEmailVerified:true, university: uni._id,
    studentInfo:{ indexNumber:'EDU/IT/24/0002', programme:progIT._id, department:deptIT._id, faculty:fac._id, level:100, year:1, enrollmentYear:2024, expectedGraduation:2028, isCourseRep:true, courseRepFor:[c1._id], registeredCourses:[c1._id], linkedToAdmin:true }
  });
  await Course.findByIdAndUpdate(c1._id, { $addToSet:{ enrolledStudents:{ $each:[student._id,rep._id] } }, courseRep:rep._id });
  await Course.findByIdAndUpdate(c3._id, { $addToSet:{ enrolledStudents:student._id } });
  console.log('Students created');

  // Parent
  const parent = await User.create({
    firstName:'Yaw', lastName:'Asante', email:'parent@edubridge.edu', password:'Parent@123',
    role:'parent', isActive:true, isEmailVerified:true, university: uni._id,
    parentInfo:{ occupation:'Engineer', linkedStudents:[student._id], relationship:'Father' }
  });
  await User.findByIdAndUpdate(student._id, { 'studentInfo.parent':parent._id });
  console.log('Parent created');

  // Fee structure
  const feeStruct = await FeeStructure.create({
    name:'IT Level 100 Fees 2024/2025 Sem 1', academicYear:'2024/2025', semester:1, programme:progIT._id, level:100,
    items:[
      { name:'Tuition Fee',      amount:2500, isMandatory:true },
      { name:'Examination Fee',  amount:200,  isMandatory:true },
      { name:'Library Fee',      amount:100,  isMandatory:true },
      { name:'IT/Lab Fee',       amount:300,  isMandatory:true },
      { name:'Student Union',    amount:50,   isMandatory:true },
      { name:'Medical Fee',      amount:100,  isMandatory:true },
    ],
    totalAmount:3250, currency:'GHS', dueDate:new Date('2024-10-01'), isActive:true, createdBy:admin._id, university: uni._id
  });

  await FeeBill.create({
    student:student._id, feeStructure:feeStruct._id, semester:semester._id, academicYear:'2024/2025', university: uni._id,
    totalBilled:3250, totalPaid:1500, dueDate:new Date('2024-10-01'),
    payments:[{ amount:1500, paidAt:new Date('2024-09-05'), method:'mobile_money', reference:'MM-2024-001234', receiptNumber:'RCP-001', processedBy:admin._id }]
  });
  console.log('Fees created');

  await Announcement.create([
    { title:'Welcome to 2024/2025', content:'The administration warmly welcomes all students and staff.', type:'General', priority:'high', targetRoles:['all'], isPublished:true, isPinned:true, createdBy:admin._id, university: uni._id },
    { title:'Course Registration Open', content:'All students must register their courses before September 20.', type:'Academic', priority:'urgent', targetRoles:['student'], isPublished:true, createdBy:admin._id, university: uni._id },
    { title:'Exam Timetable Released', content:'End-of-semester exam timetable is now available.', type:'Exam', priority:'high', targetRoles:['student','teacher'], isPublished:true, createdBy:admin._id, university: uni._id },
  ]);
  console.log('Announcements created');

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║        EduBridge Seed Complete ✅         ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  admin@edubridge.edu        Admin@123    ║');
  console.log('║  teacher@edubridge.edu      Teacher@123  ║');
  console.log('║  student@edubridge.edu      Student@123  ║');
  console.log('║  parent@edubridge.edu       Parent@123   ║');
  console.log('║  courserep@edubridge.edu    CourseRep@123 ║');
  console.log('╚══════════════════════════════════════════╝\n');
  process.exit(0);
};

run().catch(e => { console.error('Seed error:', e); process.exit(1); });
