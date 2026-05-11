const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const University = require('./src/models/University');
const dotenv = require('dotenv');

dotenv.config();

const seedCourseRep = async () => {
  try {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI not found in .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find University of Ghana
    let ug = await University.findOne({ shortName: 'UG' }) || await University.findOne({ name: /University of Ghana/i });
    
    if (!ug) {
      console.log('UG not found, creating it...');
      ug = await University.create({
        name: 'University of Ghana',
        shortName: 'UG',
        location: 'Legon, Accra',
        type: 'Public',
        dbName: 'uni_ug',
        logo: '/logos/ug.png'
      });
    }

    const email = 'ug.courserep@edubridge.com';
    const password = 'CourseRep@UG2024';

    // Delete existing if any
    await User.deleteOne({ email });

    const user = await User.create({
      firstName: 'Maxwell',
      lastName: 'Adu',
      email,
      password,
      role: 'course_rep',
      university: ug._id,
      universityId: 'ug',
      isActive: true,
      isEmailVerified: true,
      studentInfo: {
        indexNumber: '10928374',
        level: 300,
        isCourseRep: true
      }
    });

    console.log('\n=======================================');
    console.log('✅ COURSE REP SEEDED SUCCESSFULLY');
    console.log('=======================================');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('University: University of Ghana (UG)');
    console.log('Role:      Course Representative');
    console.log('=======================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedCourseRep();
