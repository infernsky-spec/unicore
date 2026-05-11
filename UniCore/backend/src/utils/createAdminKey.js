require('dotenv').config();
const mongoose = require('mongoose');
const AdminKey = require('../models/AdminKey');
const User = require('../models/User');

const createCreatorAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const adminEmail = 'admin@edubridge.edu';
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    console.log('Admin user not found');
    process.exit(1);
  }
  
  const key = await AdminKey.create({
    user: admin._id,
    key: 'EDUBRIDGE-CREATOR-KEY-001',
    name: 'Creator Master Key',
    isActive: true,
    expires: new Date('2030-01-01'),
    permissions: ['full']
  });
  
  console.log('\n✅ CREATOR ADMIN KEY CREATED!');
  console.log('Email:', adminEmail);
  console.log('Password:', 'Admin@123');
  console.log('Private Key:', key.key);
  console.log('\nUse this for admin login in LoginPage (select Admin role)');
  process.exit(0);
};

createCreatorAdmin().catch(console.error);

