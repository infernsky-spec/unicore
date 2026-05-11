const University = require('../models/University');
const mongoose = require('mongoose');
const { getUniversityConnection, getModel } = require('../utils/tenancy');

const universityMiddleware = async (req, res, next) => {
  try {
    let universityId = req.headers['x-university-id'] || req.query.universityId;
    
    if (req.user && req.user.university) {
      universityId = req.user.university._id || req.user.university;
    }
    
    if (!universityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'University context required. Please select university first.' 
      });
    }
    
    let university;
    if (universityId && mongoose.Types.ObjectId.isValid(universityId)) {
      university = await University.findById(universityId);
    }
    
    if (!university && universityId) {
      // Try shortName match (e.g., 'UG', 'KNUST')
      university = await University.findOne({ shortName: { $regex: new RegExp('^' + universityId + '$', 'i') } });
    }

    if (!university && universityId) {
      // Try slug/id match — frontend stores universities with an `id` field like 'ug', 'knust'
      // This maps to the shortName prefix. Try a partial/case-insensitive match.
      university = await University.findOne({ 
        $or: [
          { shortName: { $regex: new RegExp(universityId, 'i') } },
          { name: { $regex: new RegExp(universityId, 'i') } }
        ]
      });
    }
    
    // Final fallback: If no university found, use first active one
    if (!university) {
      university = await University.findOne({ isActive: true });
    }

    if (!university) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active university found in the system.' 
      });
    }

    // ─── MULTI-TENANCY LOGIC ───
    // Get connection to the specific university database
    const dbName = university.dbName || `uni_${university.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const connection = await getUniversityConnection(dbName);
    
    // Attach connection and model helper to request
    req.universityId = university._id;
    req.university = university;
    req.tenantConnection = connection;
    
    // Helper to get a model on the current tenant's connection
    req.db = {
      model: (modelName) => getModel(connection, modelName),
      // Common models for quick access
      User: getModel(connection, 'User'),
      Course: getModel(connection, 'Course'),
      Attendance: getModel(connection, 'Attendance'),
      Semester: getModel(connection, 'Semester')
    };

    next();
  } catch (error) {
    console.error('University middleware error:', error);
    res.status(500).json({ success: false, message: 'University lookup failed.' });
  }
};

module.exports = universityMiddleware;

