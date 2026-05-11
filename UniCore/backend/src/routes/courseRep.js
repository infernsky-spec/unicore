const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const universityAuth = require('../middleware/university');
const { 
  submitRequest, 
  getLecturerRequests, 
  approveRequest, 
  rejectRequest, 
  getMyStatus 
} = require('../controllers/courseRepController');

// Submit course rep request (student)
router.post('/submit', protect, universityAuth, submitRequest);

// Get pending course rep requests (lecturer)
router.get('/lecturer/requests', protect, universityAuth, getLecturerRequests);

// Approve course rep request (lecturer only)
router.patch('/:id/approve', protect, universityAuth, approveRequest);

// Reject course rep request (lecturer)
router.patch('/:id/reject', protect, universityAuth, rejectRequest);

// Get my course rep status (student)
router.get('/my-status', protect, universityAuth, getMyStatus);

module.exports = router;
