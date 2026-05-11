require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  const uni = await University.create({
    name: 'EduBridge University',
    shortName: 'EduBridge',
    location: 'Campus',
    type: 'Private',
    logo: '🏫',
    isActive: true
  });
  console.log('Default uni:', uni.shortName, uni._id);

  // Update seeded users
  await User.updateMany({ universityId: { $exists: false } }, { $set: { university: uni._id, universityId: uni.id } });
  console.log('Users updated');

  console.log('Default University created & users updated.');
  process.exit(0);
};

run().catch(console.error);
