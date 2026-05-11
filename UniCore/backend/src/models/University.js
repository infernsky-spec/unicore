const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  shortName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [10, 'Short name too long']
  },
  dbName: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: '🏫'
  },
  imageUrl: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Public', 'Technical', 'Private', 'College'],
    default: 'College'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  anthropicApiKey: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('University', universitySchema);
