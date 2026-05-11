const mongoose = require('mongoose');

const staffVerificationSchema = new mongoose.Schema({
  idNumber: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['teacher', 'dept_head', 'faculty_head', 'admin'] 
  },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  faculty: { type: String }, // For HOD and Faculty Head
  department: { type: String }, // For Teacher and HOD
  isUsed: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffVerification', staffVerificationSchema);
