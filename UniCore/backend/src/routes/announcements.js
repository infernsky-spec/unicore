const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/', protect, async (req, res) => {
  try {
    const Announcement = req.db.model('Announcement');
    const { type, priority, page=1, limit=10 } = req.query;
    const q = {};

    // Standard users only see published and non-expired announcements
    if (['student', 'parent'].includes(req.user.role)) {
      q.isPublished = true;
      q.$or = [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }];
    }
    if (type)     q.type     = type;
    if (priority) q.priority = priority;
    const data  = await Announcement.find(q).populate('createdBy','firstName lastName role').sort({ isPinned:-1, createdAt:-1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await Announcement.countDocuments(q);
    return res.json({ success:true, data, total, pages:Math.ceil(total/limit) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', protect, authorise('admin','teacher'), async (req, res) => {
  try {
    const Announcement = req.db.model('Announcement');
    const a = await Announcement.create({ ...req.body, createdBy:req.user._id });
    req.app.get('io').to(`university_${req.universityId}`).emit('new_announcement', { title:a.title, type:a.type, priority:a.priority });
    return res.status(201).json({ success:true, data:a });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.put('/:id', protect, authorise('admin'), async (req, res) => {
  try { 
    const Announcement = req.db.model('Announcement');
    return res.json({ success:true, data: await Announcement.findByIdAndUpdate(req.params.id, req.body, { new:true }) }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.delete('/:id', protect, authorise('admin'), async (req, res) => {
  try { 
    const Announcement = req.db.model('Announcement');
    await Announcement.findByIdAndDelete(req.params.id); return res.json({ success:true, message:'Deleted.' }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/read', protect, async (req, res) => {
  try { 
    const Announcement = req.db.model('Announcement');
    await Announcement.findByIdAndUpdate(req.params.id, { $addToSet:{ readBy:req.user._id } }); return res.json({ success:true }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
