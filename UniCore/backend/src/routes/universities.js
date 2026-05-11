const express = require('express');
const { 
  getUniversities, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity, 
  upload 
} = require('../controllers/universityController');
const { protect, authorise } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getUniversities)
  .post(protect, authorise('admin'), upload.single('image'), createUniversity);

router.route('/:id')
  .put(protect, authorise('admin'), upload.single('image'), updateUniversity)
  .delete(protect, authorise('admin'), deleteUniversity);

module.exports = router;

