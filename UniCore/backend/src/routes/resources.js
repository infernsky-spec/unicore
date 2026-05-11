const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');
const { Resource } = require('../models/Academic2');
const multer = require('multer');

router.use(universityMiddleware);
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const fs     = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname,'../../uploads/resources');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive:true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits:{ fileSize:10*1024*1024 } });

router.get('/', protect, async (req, res) => {
  try {
    const { courseId, type, semesterId, page=1, limit=20 } = req.query;
    const q = { isActive:true, university: req.universityId };
    if (courseId)   q.course   = courseId;
    if (type)       q.type     = type;
    if (semesterId) q.semester = semesterId;
    const data  = await Resource.find(q).populate('course','title code').populate('uploadedBy','firstName lastName role').sort({ createdAt:-1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await Resource.countDocuments(q);
    return res.json({ success:true, data, total });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', protect, authorise('teacher','admin'), upload.single('file'), async (req, res) => {
  try {
    const d = { ...req.body, uploadedBy:req.user._id, university: req.universityId };
    if (req.file) { d.filename=req.file.originalname; d.filePath=`/uploads/resources/${req.file.filename}`; d.fileSize=req.file.size; d.mimeType=req.file.mimetype; }
    return res.status(201).json({ success:true, data: await Resource.create(d) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', protect, authorise('teacher','admin'), async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ success:false, message:'Not found.' });
    if (r.uploadedBy.toString()!==req.user._id.toString() && req.user.role!=='admin')
      return res.status(403).json({ success:false, message:'Not authorised.' });
    if (r.filePath) { const fp = path.join(__dirname,'../../',r.filePath); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    await Resource.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message:'Deleted.' });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/download', protect, async (req, res) => {
  try { await Resource.findByIdAndUpdate(req.params.id, { $inc:{ downloadCount:1 } }); return res.json({ success:true }); }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
