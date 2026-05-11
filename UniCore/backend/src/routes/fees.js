const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');

router.use(universityMiddleware);

router.get('/structures', protect, async (req, res) => {
  try { 
    const FeeStructure = req.db.model('FeeStructure');
    return res.json({ success:true, data: await FeeStructure.find({ isActive:true }).populate('programme','name code') }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/structures', protect, authorise('admin'), async (req, res) => {
  try { 
    const FeeStructure = req.db.model('FeeStructure');
    return res.status(201).json({ success:true, data: await FeeStructure.create({ ...req.body, createdBy:req.user._id }) }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.put('/structures/:id', protect, authorise('admin'), async (req, res) => {
  try { 
    const FeeStructure = req.db.model('FeeStructure');
    return res.json({ success:true, data: await FeeStructure.findOneAndUpdate({ _id: req.params.id }, req.body, { new:true }) }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/my-bill', protect, authorise('student','course_rep'), async (req, res) => {
  try {
    const FeeBill = req.db.model('FeeBill');
    const bills = await FeeBill.find({ student:req.user._id }).populate('feeStructure','name items').populate('semester','name academicYear').sort({ createdAt:-1 });
    return res.json({ success:true, data:bills });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/student/:studentId', protect, authorise('admin','parent'), async (req, res) => {
  try {
    const FeeBill = req.db.model('FeeBill');
    const bills = await FeeBill.find({ student:req.params.studentId }).populate('feeStructure','name items').populate('semester','name academicYear').sort({ createdAt:-1 });
    return res.json({ success:true, data:bills });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/bills', protect, authorise('admin'), async (req, res) => {
  try { 
    const FeeBill = req.db.model('FeeBill');
    return res.status(201).json({ success:true, data: await FeeBill.create({ ...req.body }) }); 
  }
  catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/bills/bulk', protect, authorise('admin'), async (req, res) => {
  try {
    const FeeStructure = req.db.model('FeeStructure');
    const FeeBill = req.db.model('FeeBill');
    const { semesterId, feeStructureId, studentIds, academicYear } = req.body;
    const structure = await FeeStructure.findOne({ _id: feeStructureId });
    if (!structure) return res.status(404).json({ success:false, message:'Fee structure not found.' });
    const bills = studentIds.map(sid => ({ student:sid, feeStructure:feeStructureId, semester:semesterId, academicYear, totalBilled:structure.totalAmount, dueDate:structure.dueDate }));
    const created = await FeeBill.insertMany(bills, { ordered:false });
    return res.json({ success:true, message:`Created ${created.length} bills.` });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.post('/bills/:id/payments', protect, authorise('admin'), async (req, res) => {
  try {
    const FeeBill = req.db.model('FeeBill');
    const { amount, method, reference, notes } = req.body;
    const bill = await FeeBill.findOne({ _id: req.params.id });
    if (!bill) return res.status(404).json({ success:false, message:'Bill not found.' });
    bill.payments.push({ amount, method, reference, notes, processedBy:req.user._id });
    bill.totalPaid += parseFloat(amount);
    await bill.save();
    return res.json({ success:true, message:'Payment recorded.', data:bill });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.patch('/bills/:id/waive', protect, authorise('admin'), async (req, res) => {
  try {
    const FeeBill = req.db.model('FeeBill');
    const bill = await FeeBill.findOneAndUpdate({ _id: req.params.id }, { status:'waived', waivedBy:req.user._id, waiveReason:req.body.reason }, { new:true });
    return res.json({ success:true, data:bill });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

router.get('/bills', protect, authorise('admin'), async (req, res) => {
  try {
    const FeeBill = req.db.model('FeeBill');
    const { status, semesterId, page=1, limit=20 } = req.query;
    const q = {};
    if (status)     q.status   = status;
    if (semesterId) q.semester = semesterId;
    const bills = await FeeBill.find(q).populate('student','firstName lastName studentInfo.indexNumber studentInfo.level').populate('semester','name').sort({ createdAt:-1 }).skip((page-1)*limit).limit(parseInt(limit));
    const total = await FeeBill.countDocuments(q);
    return res.json({ success:true, data:bills, total, pages:Math.ceil(total/limit) });
  } catch(e){ return res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
