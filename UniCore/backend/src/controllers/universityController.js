const University = require('../models/University');
const multer = require('multer');
const path = require('path');

// Multer upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/universities/'),
  filename: (req, file, cb) => cb(null, `uni-${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});

// @desc    Get all universities
// @route   GET /api/universities
const getUniversities = async (req, res, next) => {
  try {
    const universities = await University.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: universities.length, data: universities });
  } catch (error) {
    next(error);
  }
};

// @desc    Create university
// @route   POST /api/universities
const createUniversity = async (req, res, next) => {
  try {
    const { name, shortName, location, type, logo } = req.body;
    
    const university = new University({
      name, shortName, location, type, logo,
      imageUrl: req.file ? `/uploads/universities/${req.file.filename}` : null,
      createdBy: req.user?.id
    });

    await university.save();
    res.status(201).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
const updateUniversity = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = `/uploads/universities/${req.file.filename}`;
    
    const university = await University.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    
    if (!university) return res.status(404).json({ success: false, message: 'University not found' });
    
    res.json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete university
// @route   DELETE /api/universities/:id
const deleteUniversity = async (req, res, next) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) return res.status(404).json({ success: false, message: 'University not found' });
    res.json({ success: true, message: 'University deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUniversities,
  createUniversity,
  updateUniversity, 
  deleteUniversity,
  upload
};

