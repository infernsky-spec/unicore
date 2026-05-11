const express = require('express');
const router  = express.Router();
const { protect, authorise } = require('../middleware/auth');
const universityMiddleware = require('../middleware/university');
const { getAdminStats, getStudentStats, getTeacherStats, getGlobalStats } = require('../controllers/statsController');

router.get('/global',  protect, authorise('super_admin'),      async(req,res)=>{ try{ await getGlobalStats(req,res); }catch(e){ res.status(500).json({success:false,message:e.message}); } });
router.get('/admin',   protect, authorise('admin'),            async(req,res)=>{ try{ await getAdminStats(req,res); }catch(e){ res.status(500).json({success:false,message:e.message}); } });
router.get('/student', protect, universityMiddleware, authorise('student','course_rep'), async(req,res)=>{ try{ await getStudentStats(req,res); }catch(e){ res.status(500).json({success:false,message:e.message}); } });
router.get('/teacher', protect, universityMiddleware, authorise('teacher'), async(req,res)=>{ try{ await getTeacherStats(req,res); }catch(e){ res.status(500).json({success:false,message:e.message}); } });

module.exports = router;
