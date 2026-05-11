const User = require('../models/User');
const AdminKey = require('../models/AdminKey');
const University = require('../models/University');
const Admission = require('../models/Admission');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Fixed generateToken functions with fallback
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'edubridge-super-secret-key-2024-do-not-use-in-prod!!';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};
const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'edubridge-refresh-super-secret-key-2024-do-not-use-in-prod!!';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, privateKey } = req.body;
    if (!email || !privateKey)
      return res.status(400).json({ success: false, message: 'Email and private key required.' });

    // Admins might be in the main DB or tenant DB. 
    // Usually, admins are in the main DB.
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.role !== 'admin')
      return res.status(401).json({ success: false, message: 'Admin account not found.' });

    const AdminKey = req.db.model('AdminKey');
    const activeKey = await AdminKey.findOne({ user: user._id, isActive: true, expires: { $gt: new Date() } });
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true, 
      message: activeKey ? 'Admin login successful.' : 'Identity verified. Activation required.',
      token, 
      refreshToken,
      needsActivation: !activeKey,
      user: user.toPublicJSON()
    });
  } catch (err) {
    console.error('ADMIN LOGIN ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role: loginRole } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    let user;

    // ─── SUPER ADMIN FAST PATH ───────────────────────────────────────────────
    // Super admins live in the global database, not any tenant DB
    if (loginRole === 'super_admin') {
      user = await User.findOne({ email: email.toLowerCase().trim(), role: 'super_admin' }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Super Admin account not found in global registry.' });
      }
    } else {
      // ─── TENANT LOOKUP ───────────────────────────────────────────────────────
      const query = { email: email.toLowerCase().trim() };
      if (loginRole && loginRole !== 'admin') query.role = loginRole;

      user = await req.db.User.findOne(query).select('+password');

      // Fallback: Check Global Database (for accounts not found in tenant)
      if (!user) {
        user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      }
    }

    if (!user)
      return res.status(401).json({ success: false, message: 'Account not found.' });

    const isMatch = await user.comparePassword(password || '');
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password.' });

    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    user.password = undefined;

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true, 
      message: 'Login successful.',
      token, 
      refreshToken,
      user: user.toPublicJSON ? user.toPublicJSON() : { _id: user._id, email: user.email, role: user.role, university: user.university }
    });
  } catch (err) {
    console.error('LOGIN ERROR DETAILED:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, staffID, studentInfo, teacherInfo, facultyHeadInfo, deptHeadInfo, courseRepInfo } = req.body || {};
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    
    const safeEmail = email.toLowerCase().trim();
    const university = req.university;
    const TenantUser = req.db.User;
    const StaffVerification = req.db.model('StaffVerification');
    const Admission = req.db.model('Admission');
    
    // Check if user already exists in THIS tenant DB
    const existing = await TenantUser.findOne({ email: safeEmail });
    if (existing) return res.status(400).json({ success: false, message: 'Identity already registered in this university node.' });

    // Course Rep Specific Initialization
    if (role === 'course_rep') {
      if (!courseRepInfo?.lecturerId || !courseRepInfo?.department) {
        return res.status(400).json({ success: false, message: 'Lecturer and Department required for Course Rep registration.' });
      }
    }

    // Staff Verification
    if (['teacher', 'faculty_head', 'dept_head'].includes(role)) {
      if (!staffID) return res.status(400).json({ success: false, message: 'Access ID is required for this role.' });
      
      const verification = await StaffVerification.findOne({ 
        idNumber: staffID, 
        role: role,
        isUsed: false 
      });

      if (!verification) {
        return res.status(401).json({ success: false, message: 'Invalid or already used Access ID for this role.' });
      }
      
      if (role === 'teacher' && verification.department) {
        teacherInfo.department = verification.department;
        teacherInfo.faculty = verification.faculty;
      }
      if (role === 'faculty_head' && verification.faculty) {
        facultyHeadInfo.faculty = verification.faculty;
      }
      if (role === 'dept_head' && verification.department) {
        deptHeadInfo.department = verification.department;
        deptHeadInfo.faculty = verification.faculty;
      }
    }

    // Index Number Verification for Students
    if (role === 'student' && studentInfo?.indexNumber) {
      const admission = await Admission.findOne({ 
        indexNumber: studentInfo.indexNumber, 
        isRegistered: false 
      });
      if (!admission) {
        return res.status(400).json({ success: false, message: 'Invalid or already registered index number.' });
      }
    }
    
    const userData = { 
      firstName, lastName, email: safeEmail, password, role,
      university: university?._id || null,
      universityId: university?.shortName || 'unknown',
      isActive: role === 'course_rep' ? false : true 
    };
    
    if (studentInfo || role === 'course_rep') {
      userData.studentInfo = studentInfo || {};
      if (role === 'course_rep') userData.studentInfo.isCourseRep = true;
    }
    if (teacherInfo) userData.teacherInfo = teacherInfo;
    if (facultyHeadInfo) userData.facultyHeadInfo = facultyHeadInfo;
    if (deptHeadInfo) userData.deptHeadInfo = deptHeadInfo;
    
    const user = new TenantUser(userData);
    await user.save();

    // Create Course Rep Request if applicable
    if (role === 'course_rep') {
      const CourseRepRequest = req.db.model('CourseRepRequest');
      await CourseRepRequest.create({
        studentId: user._id,
        lecturerId: courseRepInfo.lecturerId,
        university: university?._id,
        department: courseRepInfo.department,
        status: 'pending'
      });
    }
    
    // Mark Staff ID as used
    if (['teacher', 'faculty_head', 'dept_head'].includes(role)) {
      await StaffVerification.findOneAndUpdate(
        { idNumber: staffID },
        { isUsed: true, usedBy: user._id }
      );

      // AUTOMATION: If Faculty Head registers, generate HOD IDs for their departments
      if (role === 'faculty_head') {
        try {
          const Faculty = req.db.model('Faculty');
          const Department = req.db.model('Department');
          const facultyName = facultyHeadInfo?.faculty;
          if (facultyName) {
            const facultyObj = await Faculty.findOne({ name: facultyName });
            if (facultyObj) {
              const departments = await Department.find({ faculty: facultyObj._id });
              
              for (const dept of departments) {
                const hodId = `HOD-${facultyObj.code}-${dept.code}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                await StaffVerification.create({
                  idNumber: hodId,
                  role: 'dept_head',
                  university: university?._id,
                  faculty: facultyName,
                  department: dept.name
                });
                console.log(`Generated HOD ID for ${dept.name}: ${hodId}`);
              }
            }
          }
        } catch (autoErr) {
          console.error('HOD AUTO-GEN ERROR:', autoErr);
        }
      }
    }

    // Update admission record if applicable
    if (role === 'student' && studentInfo?.indexNumber) {
      await Admission.findOneAndUpdate(
        { indexNumber: studentInfo.indexNumber },
        { isRegistered: true, registeredUser: user._id }
      );
    }
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.password = undefined;

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      token, 
      refreshToken,
      user: user.toPublicJSON()
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleAuth = async (req, res) => res.status(501).json({ success: false, message: 'Google auth not implemented' });
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required.' });

    const secret = process.env.JWT_REFRESH_SECRET || 'edubridge-refresh-super-secret-key-2024-do-not-use-in-prod!!';
    const decoded = jwt.verify(refreshToken, secret);
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token.' });

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('REFRESH TOKEN ERROR:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect old password.' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, gender, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, address, gender, dateOfBirth },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully.',
      user: user.toPublicJSON ? user.toPublicJSON() : user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => res.status(200).json({ success: true, message: 'Logged out' });

