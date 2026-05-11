const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const { getUniversityConnection, getModel } = require('../utils/tenancy');
const University = require('../models/University');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

    const secret = process.env.JWT_SECRET || 'edubridge-super-secret-key-2024-do-not-use-in-prod!!';
    const decoded = jwt.verify(token, secret);

    // ─── TENANCY RESOLUTION IN PROTECT ───
    let universityId = req.headers['x-university-id'] || req.query.universityId;
    
    // We need to find the university to know which DB to connect to
    let university;
    if (universityId) {
      if (require('mongoose').Types.ObjectId.isValid(universityId)) {
        university = await University.findById(universityId);
      } else {
        university = await University.findOne({ shortName: { $regex: new RegExp('^' + universityId + '$', 'i') } });
      }
    }
    
    // Fallback to first active uni if no ID provided (not ideal, but handles some cases)
    if (!university) university = await University.findOne({ isActive: true });
    
    // ─── USER RESOLUTION ───
    let user;
    let TenantUser;
    let connection;

    if (university) {
      const dbName = university.dbName || `uni_${university.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      connection = await getUniversityConnection(dbName);
      TenantUser = getModel(connection, 'User');
      user = await TenantUser.findById(decoded.id).select('-password');
    }

    // Fallback to main database (for Super Admins)
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      if (user && user.role !== 'super_admin') {
         // Non-super-admins MUST be in a university node
         user = null;
      }
    }

    if (!user)           return res.status(401).json({ success: false, message: 'User not found or invalid node context.' });
    if (!user.isActive)  return res.status(403).json({ success: false, message: 'Account deactivated.' });

    req.user = user;
    req.universityId = university?._id;
    req.university = university;
    req.tenantConnection = connection || require('mongoose').connection;

    if (connection) {
      req.db = {
        model: (modelName) => getModel(connection, modelName),
        User: TenantUser,
        Course: getModel(connection, 'Course'),
        Attendance: getModel(connection, 'Attendance'),
        Semester: getModel(connection, 'Semester')
      };
    } else {
      req.db = {
        model: (modelName) => require('mongoose').model(modelName),
        User: User,
        Course: require('mongoose').model('Course'),
        Attendance: require('mongoose').model('Attendance'),
        Semester: require('mongoose').model('Semester')
      };
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token or university context.' });
  }
};

exports.authorise = (...roles) => (req, res, next) => {
  // super_admin always has global access
  if (req.user.role === 'super_admin') return next();
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Required: ${roles.join(', ')}` });
  }
  next();
};

exports.generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
