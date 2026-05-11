const express  = require('express');
const router   = express.Router();
const { protect, authorise } = require('../middleware/auth');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const User     = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname,'../../uploads/imports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `import_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 } });

// POST /api/import/students - CSV/JSON bulk import
router.post('/students', protect, authorise('admin'), upload.single('file'), async (req, res) => {
  try {
    let students = [];

    if (req.file) {
      const content = fs.readFileSync(req.file.path, 'utf-8');
      if (req.file.originalname.endsWith('.json')) {
        students = JSON.parse(content);
      } else {
        // CSV parse (simple)
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/"/g,''));
          const obj  = {};
          headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
          students.push(obj);
        }
      }
    } else if (req.body.students) {
      students = typeof req.body.students === 'string' ? JSON.parse(req.body.students) : req.body.students;
    }

    const results = { created: 0, skipped: 0, errors: [] };
    for (const s of students) {
      try {
        const email = (s.email || s.Email || `${s.indexNumber || s.index_number || Date.now()}@import.edu`).toLowerCase();
        const exists = await User.findOne({ $or: [{ email }, { 'studentInfo.indexNumber': s.indexNumber || s.index_number }] });
        if (exists) { results.skipped++; continue; }

        await User.create({
          firstName: s.firstName || s.first_name || s.FirstName || 'Student',
          lastName:  s.lastName  || s.last_name  || s.LastName  || 'Imported',
          email,
          password:  s.password  || 'EduBridge@123',
          role:      'student',
          isActive:  true,
          university: req.universityId,
          studentInfo: {
            indexNumber:   s.indexNumber || s.index_number || s.IndexNumber,
            level:         parseInt(s.level || s.Level) || 100,
            enrollmentYear: parseInt(s.enrollmentYear || s.enrollment_year) || new Date().getFullYear(),
          }
        });
        results.created++;
      } catch (e) {
        results.errors.push(`Row ${students.indexOf(s)+1}: ${e.message}`);
      }
    }
    return res.json({ success: true, message: `Import complete. Created: ${results.created}, Skipped: ${results.skipped}`, results });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
});

// POST /api/import/link-student - link student ID to account
router.post('/link-student', protect, authorise('admin'), async (req, res) => {
  try {
    const { userId, indexNumber } = req.body;
    if (!userId || !indexNumber) return res.status(400).json({ success: false, message: 'userId and indexNumber required.' });

    await User.findByIdAndUpdate(userId, { 'studentInfo.indexNumber': indexNumber, 'studentInfo.linkedToAdmin': true });
    return res.json({ success: true, message: 'Student ID linked successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/import/self-link - student links their own ID
router.post('/self-link', protect, authorise('student','course_rep'), async (req, res) => {
  try {
    const { indexNumber } = req.body;
    if (!indexNumber) return res.status(400).json({ success: false, message: 'Index number required.' });
    const exists = await User.findOne({ 'studentInfo.indexNumber': indexNumber, _id: { $ne: req.user._id } });
    if (exists) return res.status(400).json({ success: false, message: 'This index number is already linked to another account.' });
    await User.findByIdAndUpdate(req.user._id, { 'studentInfo.indexNumber': indexNumber });
    return res.json({ success: true, message: 'Index number linked to your account.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
