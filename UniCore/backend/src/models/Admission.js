const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  indexNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String }, // Optional, if known
  faculty: { type: String },
  department: { type: String },
  level: { type: Number, default: 100 },
  admissionYear: { type: Number, default: () => new Date().getFullYear() },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  isRegistered: { type: Boolean, default: false },
  registeredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

admissionSchema.index({ indexNumber: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('Admission', admissionSchema);
