const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  course:   { type:mongoose.Schema.Types.ObjectId, ref:'Course',   required:true },
  semester: { type:mongoose.Schema.Types.ObjectId, ref:'Semester', required:true },
  type:     { type:String, enum:['Mid-Semester','End-of-Semester','Resit','Supplementary','Quiz'], required:true },
  date:     { type:Date,   required:true },
  startTime:{ type:String },
  endTime:  { type:String },
  duration: { type:Number },
  venue:    { type:String, required:true },
  roomCapacity: Number,
  chiefInvigilator:      { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  assistantInvigilators: [{ type:mongoose.Schema.Types.ObjectId, ref:'User' }],
  totalMarks:   { type:Number, default:100 },
  passMark:     { type:Number, default:50 },
  instructions: String,
  allowedMaterials: [String],
  isPublished:  { type:Boolean, default:false },
  publishedAt:  Date,
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  createdBy:    { type:mongoose.Schema.Types.ObjectId, ref:'User' },
}, { timestamps: true });

examSchema.index({ course: 1, semester: 1, university: 1 });

const resultSchema = new mongoose.Schema({
  student:  { type:mongoose.Schema.Types.ObjectId, ref:'User',    required:true },
  course:   { type:mongoose.Schema.Types.ObjectId, ref:'Course',  required:true },
  semester: { type:mongoose.Schema.Types.ObjectId, ref:'Semester',required:true },
  exam:     { type:mongoose.Schema.Types.ObjectId, ref:'Exam' },
  continuousAssessment: { type:Number, default:0, max:40 },
  examScore:            { type:Number, default:0, max:60 },
  totalScore:           { type:Number, default:0 },
  grade:      { type:String, enum:['A+','A','B+','B','C+','C','D+','D','F','IC','WD'] },
  gradePoint: { type:Number },
  remark:     { type:String, enum:['Pass','Fail','Incomplete','Withdrawn','Distinction','Credit'] },
  isPublished:{ type:Boolean, default:false },
  publishedAt:Date,
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  uploadedBy: { type:mongoose.Schema.Types.ObjectId, ref:'User' },
}, { timestamps: true });

resultSchema.index({ student: 1, course: 1, semester: 1, university: 1 }, { unique: true });

resultSchema.pre('save', function(next) {
  this.totalScore = (this.continuousAssessment||0) + (this.examScore||0);
  const s = this.totalScore;
  if (s>=80){ this.grade='A+'; this.gradePoint=4.0; this.remark='Distinction'; }
  else if(s>=75){ this.grade='A';  this.gradePoint=4.0; this.remark='Pass'; }
  else if(s>=70){ this.grade='B+'; this.gradePoint=3.5; this.remark='Pass'; }
  else if(s>=65){ this.grade='B';  this.gradePoint=3.0; this.remark='Pass'; }
  else if(s>=60){ this.grade='C+'; this.gradePoint=2.5; this.remark='Pass'; }
  else if(s>=55){ this.grade='C';  this.gradePoint=2.0; this.remark='Pass'; }
  else if(s>=50){ this.grade='D+'; this.gradePoint=1.5; this.remark='Pass'; }
  else if(s>=45){ this.grade='D';  this.gradePoint=1.0; this.remark='Pass'; }
  else           { this.grade='F';  this.gradePoint=0;   this.remark='Fail'; }
  next();
});

const announcementSchema = new mongoose.Schema({
  title:   { type:String, required:true },
  content: { type:String, required:true },
  type:    { type:String, enum:['General','Exam','Fees','Event','Emergency','Academic'], default:'General' },
  priority:{ type:String, enum:['low','normal','high','urgent'], default:'normal' },
  university: { type: mongoose.Schema.Types.ObjectId, ref:'University', required: true },
  targetRoles: [String],
  targetDepartments: [{ type:mongoose.Schema.Types.ObjectId, ref:'Department' }],
  publishAt:   { type:Date, default:Date.now },
  expiresAt:   Date,
  isPublished: { type:Boolean, default:true },
  isPinned:    { type:Boolean, default:false },
  attachments: [{ filename:String, path:String, size:Number }],
  createdBy:   { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  readBy:      [{ type:mongoose.Schema.Types.ObjectId, ref:'User' }],
},{ timestamps:true });

const resourceSchema = new mongoose.Schema({
  title:       { type:String, required:true },
  description: String,
  type:        { type:String, enum:['Document','Video','Link','Slide','Past Paper','Assignment','Other'], required:true },
  course:      { type:mongoose.Schema.Types.ObjectId, ref:'Course' },
  semester:    { type:mongoose.Schema.Types.ObjectId, ref:'Semester' },
  filename:    String,
  filePath:    String,
  fileSize:    Number,
  mimeType:    String,
  externalUrl: String,
  uploadedBy:  { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  visibility:  { type:String, enum:['public','enrolled','restricted'], default:'enrolled' },
  isActive:    { type:Boolean, default:true },
  downloadCount:{ type:Number, default:0 },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
}, { timestamps: true });

resourceSchema.index({ course: 1, semester: 1, university: 1 });

module.exports = {
  Exam:         mongoose.model('Exam',         examSchema),
  Result:       mongoose.model('Result',       resultSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  Resource:     mongoose.model('Resource',     resourceSchema),
};
