const mongoose = require('mongoose');

const teacherPostSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  postType: { type: String, enum: ['announcement', 'assignment', 'material', 'notice', 'discussion'], default: 'announcement' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  
  // Visibility
  visibility: { type: String, enum: ['public', 'enrolled', 'private'], default: 'enrolled' },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Attachments
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    mimeType: String,
  }],
  
  // Engagement
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  
  // Status
  isPublished: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  publishAt: { type: Date, default: Date.now },
  expiresAt: Date,
  
  // Views
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  viewCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TeacherPost', teacherPostSchema);
