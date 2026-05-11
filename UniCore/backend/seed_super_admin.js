const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'super.admin@edubridge.com';
    const password = 'SuperAdmin@UniCore2024';

    // Delete existing if any in main DB
    await User.deleteOne({ email });

    const user = await User.create({
      firstName: 'UniCore',
      lastName: 'SuperAdmin',
      email,
      password,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true
    });

    console.log('\n=======================================');
    console.log('✅ SUPER ADMIN SEEDED SUCCESSFULLY');
    console.log('=======================================');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Role:      Super Administrator (Global)');
    console.log('=======================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
