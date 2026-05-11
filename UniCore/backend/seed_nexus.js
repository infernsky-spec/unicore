const mongoose = require('mongoose');
const User = require('./src/models/User');
const AdminKey = require('./src/models/AdminKey');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB...');

  const universityId = '69e62952656aa2fbe3e20b7c';
  const password = 'EduBridge@2024';

  // 1. Create Faculty Head
  const fHeadEmail = 'facultyhead@edubridge.edu';
  await User.deleteOne({ email: fHeadEmail }); // Clear existing
  const fHead = new User({
    firstName: 'Alexander',
    lastName: 'Pierce',
    email: fHeadEmail,
    password: password,
    role: 'faculty_head',
    userId: 'FCH-2026-9999',
    university: universityId,
    universityId: 'Central',
    facultyHeadInfo: { faculty: 'Faculty of Science' }
  });
  await fHead.save();
  console.log('Created Faculty Head:', fHeadEmail);

  // 2. Create Dept Head
  const dHeadEmail = 'depthead@edubridge.edu';
  await User.deleteOne({ email: dHeadEmail }); // Clear existing
  const dHead = new User({
    firstName: 'Sarah',
    lastName: 'Connor',
    email: dHeadEmail,
    password: password,
    role: 'dept_head',
    userId: 'DPH-2026-9999',
    university: universityId,
    universityId: 'Central',
    deptHeadInfo: { faculty: 'Faculty of Science', department: 'Computer Science' }
  });
  await dHead.save();
  console.log('Created Dept Head:', dHeadEmail);

  // 3. Create Premium Key for Admin
  const adminEmail = 'admin@edubridge.edu';
  const admin = await User.findOne({ email: adminEmail });
  if (admin) {
    const premiumKey = 'PREMIUM-2024-X9Z2-K7P1';
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    await AdminKey.findOneAndUpdate(
      { user: admin._id },
      { 
        key: premiumKey,
        expires: expires,
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Generated Premium Key for admin:', premiumKey);
  } else {
    console.log('Admin user admin@edubridge.edu not found. Cannot generate key.');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(console.error);
