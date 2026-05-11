const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/', protect, async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const data = await Semester.find().sort({ startDate:-1 }).populate('createdBy','firstName lastName');
    return res.json({ success:true, data });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/current', protect, async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findOne({ isCurrent:true });
    if (!s) return res.status(404).json({ success:false, message:'No active semester.' });
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findById(req.params.id);
    if (!s) return res.status(404).json({ success:false, message:'Semester not found.' });
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.create({ ...req.body, createdBy:req.user._id });
    return res.status(201).json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.put('/:id', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!s) return res.status(404).json({ success:false, message:'Not found.' });
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/set-current', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    await Semester.updateMany({}, { isCurrent:false, status:'completed' });
    const s = await Semester.findByIdAndUpdate(req.params.id, { isCurrent:true, status:'active' }, { new:true });
    return res.json({ success:true, message:'Semester set as current.', data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/events', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findByIdAndUpdate(req.params.id, { $push:{ events:{ ...req.body, createdBy:req.user._id } } }, { new:true });
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/:id/goals', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findByIdAndUpdate(req.params.id, { $push:{ goals:req.body } }, { new:true });
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/:id/goals/:goalId/complete', protect, authorise('admin'), async (req, res) => {
  try {
    const Semester = req.db.model('Semester');
    const s = await Semester.findOneAndUpdate(
      { _id:req.params.id, 'goals._id':req.params.goalId },
      { $set:{ 'goals.$.isCompleted':true, 'goals.$.completedAt':new Date() } },
      { new:true }
    );
    return res.json({ success:true, data:s });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
