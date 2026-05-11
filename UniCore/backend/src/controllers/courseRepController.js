const CourseRepRequest = require('../models/CourseRepRequest');
const User = require('../models/User');

exports.submitRequest = async (req, res) => {
  try {
    const { lecturerId, department } = req.body;
    if (!req.universityId) return res.status(400).json({ success: false, message: 'University context required' });

    // Verify lecturer exists and is teacher
    const lecturer = await User.findOne({ 
      _id: lecturerId, 
      role: 'teacher',
      university: req.universityId 
    });
    if (!lecturer) return res.status(400).json({ success: false, message: 'Invalid lecturer' });

    // Check if student already course rep or has pending request
    const existing = await CourseRepRequest.findOne({
      studentId: req.user._id,
      university: req.universityId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existing) return res.status(400).json({ success: false, message: 'Request already pending or approved' });

    const request = await CourseRepRequest.create({
      studentId: req.user._id,
      lecturerId,
      university: req.universityId,
      department
    });

    // Notify lecturer
    req.app.get('io').to(`teacher_${lecturerId}`).emit('course_rep_request', {
      requestId: request._id,
      studentId: req.user._id,
      department
    });

    res.status(201).json({ success: true, message: 'Course Rep request submitted. Awaiting lecturer approval.', requestId: request._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLecturerRequests = async (req, res) => {
  try {
    const requests = await CourseRepRequest.find({
      lecturerId: req.user._id,
      university: req.universityId,
      status: 'pending'
    }).populate('studentId', 'firstName lastName studentInfo');
    
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await CourseRepRequest.findOne({ 
      _id: req.params.id, 
      lecturerId: req.user._id,
      university: req.universityId,
      status: 'pending' 
    }).populate('studentId');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found or already processed' });

    // Update student role to course_rep and activate account
    await User.findByIdAndUpdate(request.studentId._id, {
      $set: { role: 'course_rep', isActive: true }
    });

    // Update request status
    request.status = 'approved';
    request.approvedBy = req.user._id;
    await request.save();

    // Notify student
    req.app.get('io').to(`student_${request.studentId._id}`).emit('course_rep_approved', {
      message: 'Course Rep role approved!'
    });

    res.json({ success: true, message: 'Course Rep approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await CourseRepRequest.findOne({ 
      _id: req.params.id, 
      lecturerId: req.user._id,
      university: req.universityId 
    });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyStatus = async (req, res) => {
  try {
    const request = await CourseRepRequest.findOne({
      studentId: req.user._id,
      university: req.universityId
    }).populate('lecturerId', 'firstName lastName');
    
    if (!request) return res.json({ success: true, status: 'none' });
    
    res.json({ 
      success: true, 
      status: request.status,
      lecturer: request.lecturerId,
      department: request.department 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

