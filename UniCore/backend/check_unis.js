const mongoose = require('mongoose');
const University = require('./src/models/University');
const dotenv = require('dotenv');
dotenv.config();

const checkUnis = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const unis = await University.find();
  console.log('Universities in DB:', unis.map(u => ({ name: u.name, shortName: u.shortName, dbName: u.dbName })));
  process.exit(0);
};
checkUnis();
