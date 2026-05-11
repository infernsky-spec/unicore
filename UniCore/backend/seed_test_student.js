const mongoose = require('mongoose');
const User = require('./src/models/User');
const University = require('./src/models/University');
const { Course } = require('./src/models/Academic');
require('dotenv').config();

async function seedTestStudent() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge');
  console.log('Connected to DB...');

  const uni = await University.findOne({ shortName: 'KNUST' });
  if (!uni || !uni.dbName) {
    console.error('Run seed_leadership.js first!');
    process.exit(1);
  }

  // Connect to Tenant DB
  const tenantUri = `mongodb://localhost:27017/${uni.dbName}`;
  const tenantConn = await mongoose.createConnection(tenantUri).asPromise();
  console.log(`Connected to tenant DB: ${uni.dbName}`);

  const TenantUser = tenantConn.model('User', User.schema);
  const TenantCourse = tenantConn.model('Course', require('./src/models/Academic').Course.schema);

  const studentEmail = 'student@knust.edu';
  let student = await TenantUser.findOne({ email: studentEmail });
  
  if (!student) {
    student = new TenantUser({
      firstName: 'Frank',
      lastName: 'Student',
      email: studentEmail,
      password: 'password123',
      role: 'student',
      university: uni._id,
      universityId: 'KNUST',
      studentInfo: {
        indexNumber: '20230001',
        level: 100,
        department: 'Computer Engineering',
        faculty: 'Faculty of Engineering'
      }
    });
    await student.save();
    console.log('Created test student in tenant DB:', studentEmail);
  }

  // Enroll in courses
  const courses = await TenantCourse.find({ university: uni._id });
  student.studentInfo.registeredCourses = courses.map(c => c._id);
  await student.save();
  console.log(`Enrolled student in ${courses.length} courses in tenant DB.`);

  console.log('Test student setup complete.');
  await tenantConn.close();
  await mongoose.disconnect();
}

seedTestStudent().catch(console.error);
