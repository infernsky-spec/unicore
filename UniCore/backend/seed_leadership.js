const mongoose = require('mongoose');
const { Faculty, Department, Course, Semester } = require('./src/models/Academic');
const University = require('./src/models/University');
const User = require('./src/models/User');
require('dotenv').config();

async function seedLeadership() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge');
  console.log('Connected to DB...');

  // 1. Get or Create University
  let uni = await University.findOne({ shortName: 'KNUST' });
  if (!uni) {
    uni = await University.create({
      name: 'Kwame Nkrumah University of Science and Technology',
      shortName: 'KNUST',
      dbName: 'uni_knust',
      location: 'Kumasi, Ghana',
      color: '#d97706',
      logo: '🎓',
      isActive: true
    });
  } else if (!uni.dbName) {
    uni.dbName = 'uni_knust';
    await uni.save();
  }
  console.log('University:', uni.name);

  // 2. Connect to Tenant DB
  const tenantUri = `mongodb://localhost:27017/${uni.dbName}`;
  const tenantConn = await mongoose.createConnection(tenantUri).asPromise();
  console.log(`Connected to tenant DB: ${uni.dbName}`);

  const TenantSemester = tenantConn.model('Semester', Semester.schema);
  const TenantFaculty = tenantConn.model('Faculty', Faculty.schema);
  const TenantDept = tenantConn.model('Department', Department.schema);
  const TenantCourse = tenantConn.model('Course', Course.schema);
  const TenantUser = tenantConn.model('User', User.schema);

  // 3. Create Semester in Tenant DB
  let semester = await TenantSemester.findOne({ isCurrent: true });
  if (!semester) {
    semester = await TenantSemester.create({
      name: 'First Semester 2023/2024',
      academicYear: '2023/2024',
      semesterNumber: 1,
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-01-30'),
      isCurrent: true,
      status: 'active',
      university: uni._id
    });
  }

  // 4. Create Faculty in Tenant DB
  let faculty = await TenantFaculty.findOne({ name: 'Faculty of Engineering' });
  if (!faculty) {
    faculty = await TenantFaculty.create({
      name: 'Faculty of Engineering',
      code: 'ENG',
      university: uni._id
    });
  }

  // 5. Create Department in Tenant DB
  let dept = await TenantDept.findOne({ name: 'Computer Engineering' });
  if (!dept) {
    dept = await TenantDept.create({
      name: 'Computer Engineering',
      code: 'COE',
      faculty: faculty._id,
      university: uni._id
    });
  }

  // 6. Create Lecturer in Tenant DB
  const lecturerEmail = 'lecturer@knust.edu';
  let lecturer = await TenantUser.findOne({ email: lecturerEmail });
  if (!lecturer) {
    lecturer = await TenantUser.create({
      firstName: 'Dr. Robert',
      lastName: 'Ford',
      email: lecturerEmail,
      password: 'password123',
      role: 'teacher',
      university: uni._id,
      teacherInfo: {
        department: dept.name,
        faculty: faculty.name,
        staffId: 'STF-001'
      }
    });
  }

  // 7. Create Courses
  const courseData = [
    { title: 'Embedded Systems', code: 'COE 451', level: 400 },
    { title: 'Control Systems', code: 'COE 452', level: 400 },
    { title: 'Computer Networks', code: 'COE 356', level: 300 }
  ];

  const courses = [];
  for (const c of courseData) {
    let course = await TenantCourse.findOne({ code: c.code });
    if (!course) {
      course = await TenantCourse.create({
        ...c,
        creditHours: 3,
        semester: semester._id, // Link to current semester
        university: uni._id,
        department: dept._id,
        faculty: faculty._id,
        primaryTeacher: lecturer._id,
        teachers: [lecturer._id]
      });
    }
    courses.push(course);
  }

  // 6. Link current student (if any) to these courses
  const students = await TenantUser.find({ role: 'student' });
  for (const student of students) {
    student.studentInfo.registeredCourses = courses.map(c => c._id);
    await student.save();
    console.log(`Enrolled student ${student.email} in ${courses.length} courses`);
  }

  console.log('Seeding completed successfully.');
  await tenantConn.close();
  await mongoose.disconnect();
}

seedLeadership().catch(err => {
  console.error(err);
  process.exit(1);
});
