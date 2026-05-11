const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true,'First name required'], trim: true },
  lastName:  { type: String, required: [true,'Last name required'],  trim: true },
  email:     { type: String, required: [true,'Email required'], unique: true, lowercase: true, trim: true },
  password:  { type: String, required: [true,'Password required'], minlength: 6, select: false },
  role: { type: String, enum: ['super_admin','admin','teacher','student','parent','course_rep','faculty_head','dept_head'], required: true },
  userId:       { type: String, unique: true, sparse: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  universityId: { type: String, default: 'default' },
  phoneVerified: { type: Boolean, default: false },
  otpToken:     { type: String, select: false },
  otpExpires:   { type: Date, select: false },
  googleId:     { type: String, sparse: true },
  appleId:      { type: String, sparse: true },
  profilePhoto: { type: String, default: null },
  phone:        { type: String, trim: true },
  dateOfBirth:  { type: Date },
  gender:       { type: String, enum: ['Male','Female','Other'] },
  address:      { type: String },
  nationality:  { type: String, default: 'Ghanaian' },
  studentInfo: {
    indexNumber:        { type: String },
    linkedToAdmin:      { type: Boolean, default: false },
    programme:          { type: mongoose.Schema.Types.ObjectId, ref: 'Programme' },
    department:         { type: String },
    faculty:            { type: String },
    level:              { type: Number, enum: [100,200,300,400,500,600] },
    year:               { type: Number },
    enrollmentYear:     { type: Number },
    expectedGraduation: { type: Number },
    parent:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isCourseRep:        { type: Boolean, default: false },
    courseRepFor:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    registeredCourses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    emergencyContact:   { name: String, phone: String, relationship: String },
    certificateType:    { type: String },
  },
  teacherInfo: {
    staffId:        { type: String },
    department:     { type: String },
    faculty:        { type: String },
    qualification:  { type: String },
    specialization: { type: String },
    courses:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    officeLocation: { type: String },
    rank: { type: String, enum: ['Lecturer','Senior Lecturer','Associate Professor','Professor','Teaching Assistant'] },
  },
  parentInfo: {
    occupation:     { type: String },
    linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    relationship:   { type: String },
  },
  facultyHeadInfo: {
    faculty:        { type: String },
    managedDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  },
  deptHeadInfo: {
    faculty:        { type: String },
    department:     { type: String },
    managedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Programme' }],
  },
  isActive:               { type: Boolean, default: true },
  isEmailVerified:        { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  passwordResetToken:     { type: String, select: false },
  passwordResetExpires:   { type: Date,   select: false },
  lastLogin:  { type: Date },
  loginCount: { type: Number, default: 0 },
  notifications: {
    email:         { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    fees:          { type: Boolean, default: true },
    attendance:    { type: Boolean, default: true },
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch(e) { next(e); }
});

userSchema.pre('save', async function(next) {
  if (this.userId) return next();
  try {
    const map = { admin:'ADM', teacher:'TCH', student:'STU', parent:'PAR', course_rep:'CRP', faculty_head:'FCH', dept_head:'DPH' };
    const prefix = map[this.role] || 'USR';
    // Use this.constructor to refer to the specific model (and connection) of this instance
    const count  = await this.constructor.countDocuments({ role: this.role });
    const year   = new Date().getFullYear();
    const sequence = String(count + 1).padStart(4, '0');
    // Add a small random suffix to ensure uniqueness in race conditions
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.userId  = `${prefix}-${year}-${sequence}-${suffix}`;
    next();
  } catch(e) { next(e); }
});

userSchema.methods.comparePassword = function(pw) { return bcrypt.compare(pw, this.password); };

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password; delete obj.passwordResetToken;
  delete obj.passwordResetExpires; delete obj.emailVerificationToken;
  obj.fullName = `${obj.firstName} ${obj.lastName}`;
  return obj;
};

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ university: 1, universityId: 1 });

module.exports = mongoose.model('User', userSchema);
